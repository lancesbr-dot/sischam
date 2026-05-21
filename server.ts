import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import fs from "fs";
import multer from "multer";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Database Setup
  const db = new Database("sischam.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT,
      counter TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      filename TEXT,
      type TEXT,
      size INTEGER,
      url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Insert default settings if they don't exist
  const insertDefault = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  insertDefault.run("standby_mode", "youtube");
  insertDefault.run("youtube_id", "5QNMCtuNqyI");
  insertDefault.run("standby_time", "10");

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer Configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ storage });

  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  // API Routes
  app.get("/api/history", (req, res) => {
    const rows = db.prepare("SELECT * FROM calls ORDER BY timestamp DESC LIMIT 20").all();
    res.json(rows);
  });

  // Media API
  app.get("/api/media", (req, res) => {
    const rows = db.prepare("SELECT * FROM media ORDER BY timestamp DESC").all();
    res.json(rows);
  });

  app.post("/api/media/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, filename, mimetype, size } = req.file;
    const url = `/uploads/${filename}`;

    const info = db.prepare(
      "INSERT INTO media (name, filename, type, size, url) VALUES (?, ?, ?, ?, ?)"
    ).run(originalname, filename, mimetype, size, url);

    res.json({
      id: info.lastInsertRowid,
      name: originalname,
      url,
      type: mimetype,
    });
  });

  app.delete("/api/media/:id", (req, res) => {
    const { id } = req.params;
    const item = db.prepare("SELECT * FROM media WHERE id = ?").get(id) as any;

    if (item) {
      const filePath = path.join(uploadsDir, item.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      db.prepare("DELETE FROM media WHERE id = ?").run(id);
    }

    res.json({ success: true });
  });

  // Settings API
  app.get("/api/settings", (req, res) => {
    const rows = db.prepare("SELECT * FROM settings").all() as { key: string; value: string }[];
    const settingsObj = rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    
    // Ensure default answers exist
    if (!settingsObj.standby_mode) settingsObj.standby_mode = "youtube";
    if (!settingsObj.youtube_id) settingsObj.youtube_id = "5QNMCtuNqyI";
    if (!settingsObj.standby_time) settingsObj.standby_time = "10";
    
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const { standby_mode, youtube_id, standby_time } = req.body;
    
    if (standby_mode !== undefined) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("standby_mode", standby_mode);
    }
    if (youtube_id !== undefined) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("youtube_id", youtube_id);
    }
    if (standby_time !== undefined) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("standby_time", String(standby_time));
    }
    
    io.emit("settings-updated");
    res.json({ success: true });
  });

  app.delete("/api/history", (req, res) => {
    db.prepare("DELETE FROM calls").run();
    io.emit("history-cleared");
    res.json({ success: true });
  });

  app.get("/api/reports/pdf", (req, res) => {
    const doc = new PDFDocument();
    const filename = `report_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    
    doc.pipe(res);
    doc.fontSize(25).text("Relatorio de Atendimento - SISCHAM", 100, 80);
    
    const rows = db.prepare("SELECT * FROM calls ORDER BY timestamp DESC").all();
    let y = 130;
    rows.forEach((row: any) => {
      doc.fontSize(12).text(`Senha: ${row.number} - Sala: ${row.counter} - Data: ${row.timestamp}`, 100, y);
      y += 20;
    });
    
    doc.end();
  });

  app.get("/api/reports/excel", async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Chamadas");
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Senha", key: "number", width: 15 },
      { header: "Sala", key: "counter", width: 15 },
      { header: "Data/Hora", key: "timestamp", width: 25 },
    ];

    const rows = db.prepare("SELECT * FROM calls ORDER BY timestamp DESC").all();
    worksheet.addRows(rows);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  });

  // Socket.IO Logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("call-password", (data) => {
      const { number, counter } = data;
      
      // Save to DB
      const info = db.prepare("INSERT INTO calls (number, counter) VALUES (?, ?)").run(number, counter);
      
      const callData = {
        id: info.lastInsertRowid,
        number,
        counter,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all clients (TV and Control)
      io.emit("new-call", callData);
    });

    socket.on("repeat-call", (data) => {
      // Just relay the data to everyone else
      io.emit("repeat-call", data);
    });

    socket.on("settings-updated", () => {
      io.emit("settings-updated");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Vite Middleware for Dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`SISCHAM Server running at http://localhost:${PORT}`);
  });
}

startServer();
