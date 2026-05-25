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
<<<<<<< HEAD
  const httpServer = createServer(app);
=======

  const httpServer = createServer(app);

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

<<<<<<< HEAD
  const PORT = 3000;

  // Database Setup
  const db = new Database("sischam.db");
=======
  // IMPORTANTE PARA RENDER
  const PORT = process.env.PORT || 3000;

  // =========================
  // DATABASE
  // =========================

  const db = new Database("sischam.db");

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  db.exec(`
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT,
      counter TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
<<<<<<< HEAD
=======

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      filename TEXT,
      type TEXT,
      size INTEGER,
      url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
<<<<<<< HEAD
=======

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
<<<<<<< HEAD
    CREATE TABLE IF NOT EXISTS rooms_doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room TEXT UNIQUE,
      doctor TEXT,
      status TEXT DEFAULT 'available',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default settings if they don't exist
  const insertDefault = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
=======
  `);

  // Configurações padrão
  const insertDefault = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  insertDefault.run("standby_mode", "youtube");
  insertDefault.run("youtube_id", "5QNMCtuNqyI");
  insertDefault.run("standby_time", "10");

<<<<<<< HEAD
  // Insert default rooms/doctors if empty
  try {
    const roomCount = db.prepare("SELECT COUNT(*) as count FROM rooms_doctors").get() as { count: number };
    if (roomCount.count === 0) {
      const insertRoom = db.prepare("INSERT INTO rooms_doctors (room, doctor, status) VALUES (?, ?, ?)");
      insertRoom.run("Sala 01", "Dr. Nelson (Clínico)", "available");
      insertRoom.run("Sala 02", "Dra. Carolina (Pediatria)", "busy");
      insertRoom.run("Sala 03", "Dr. Alfredo (Cardiologia)", "away");
      insertRoom.run("Sala 04", "Enf. Roberta (Triagem)", "available");
    }
  } catch (err) {
    console.error("Error checking/populating default rooms_doctors:", err);
  }

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
=======
  // =========================
  // UPLOADS
  // =========================

  const uploadsDir = path.join(process.cwd(), "uploads");

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

<<<<<<< HEAD
  // Multer Configuration
=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
<<<<<<< HEAD
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
=======

    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + "-" + Math.round(Math.random() * 1e9);

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ storage });

<<<<<<< HEAD
  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  // Availability API Rules/Methods
  app.get("/api/availability", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM rooms_doctors ORDER BY room ASC").all();
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/availability", (req, res) => {
    try {
      const { id, room, doctor, status } = req.body;
      if (id) {
        db.prepare("UPDATE rooms_doctors SET room = ?, doctor = ?, status = ? WHERE id = ?")
          .run(room, doctor, status || 'available', id);
      } else {
        db.prepare("INSERT OR REPLACE INTO rooms_doctors (room, doctor, status) VALUES (?, ?, ?)")
          .run(room, doctor, status || 'available');
      }
      io.emit("availability-updated");
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/availability/status", (req, res) => {
    try {
      const { id, status } = req.body;
      db.prepare("UPDATE rooms_doctors SET status = ? WHERE id = ?").run(status, id);
      io.emit("availability-updated");
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/availability/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM rooms_doctors WHERE id = ?").run(id);
      io.emit("availability-updated");
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Routes
  app.get("/api/history", (req, res) => {
    const rows = db.prepare("SELECT * FROM calls ORDER BY timestamp DESC LIMIT 20").all();
    res.json(rows);
  });

  // Media API
  app.get("/api/media", (req, res) => {
    const rows = db.prepare("SELECT * FROM media ORDER BY timestamp DESC").all();
=======
  // =========================
  // MIDDLEWARES
  // =========================

  app.use(express.json());

  app.use("/uploads", express.static(uploadsDir));

  // =========================
  // API
  // =========================

  app.get("/api/history", (req, res) => {
    const rows = db
      .prepare("SELECT * FROM calls ORDER BY timestamp DESC LIMIT 20")
      .all();

    res.json(rows);
  });

  // =========================
  // MEDIA
  // =========================

  app.get("/api/media", (req, res) => {
    const rows = db
      .prepare("SELECT * FROM media ORDER BY timestamp DESC")
      .all();

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    res.json(rows);
  });

  app.post("/api/media/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
<<<<<<< HEAD
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, filename, mimetype, size } = req.file;
    const url = `/uploads/${filename}`;

    const info = db.prepare(
      "INSERT INTO media (name, filename, type, size, url) VALUES (?, ?, ?, ?, ?)"
    ).run(originalname, filename, mimetype, size, url);
=======
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { originalname, filename, mimetype, size } = req.file;

    const url = `/uploads/${filename}`;

    const info = db
      .prepare(
        `
        INSERT INTO media
        (name, filename, type, size, url)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .run(originalname, filename, mimetype, size, url);
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02

    res.json({
      id: info.lastInsertRowid,
      name: originalname,
      url,
      type: mimetype,
    });
  });

  app.delete("/api/media/:id", (req, res) => {
    const { id } = req.params;
<<<<<<< HEAD
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
=======

    const item = db
      .prepare("SELECT * FROM media WHERE id = ?")
      .get(id) as any;

    if (item) {
      const filePath = path.join(uploadsDir, item.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      db.prepare("DELETE FROM media WHERE id = ?").run(id);
    }

    res.json({
      success: true,
    });
  });

  // =========================
  // SETTINGS
  // =========================

  app.get("/api/settings", (req, res) => {
    const rows = db
      .prepare("SELECT * FROM settings")
      .all() as { key: string; value: string }[];

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    const settingsObj = rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
<<<<<<< HEAD
    
    // Ensure default answers exist
    if (!settingsObj.standby_mode) settingsObj.standby_mode = "youtube";
    if (!settingsObj.youtube_id) settingsObj.youtube_id = "5QNMCtuNqyI";
    if (!settingsObj.standby_time) settingsObj.standby_time = "10";
    
=======

    if (!settingsObj.standby_mode) {
      settingsObj.standby_mode = "youtube";
    }

    if (!settingsObj.youtube_id) {
      settingsObj.youtube_id = "5QNMCtuNqyI";
    }

    if (!settingsObj.standby_time) {
      settingsObj.standby_time = "10";
    }

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
<<<<<<< HEAD
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
=======
    const {
      standby_mode,
      youtube_id,
      standby_time,
    } = req.body;

    if (standby_mode !== undefined) {
      db.prepare(
        `
        INSERT OR REPLACE INTO settings (key, value)
        VALUES (?, ?)
      `
      ).run("standby_mode", standby_mode);
    }

    if (youtube_id !== undefined) {
      db.prepare(
        `
        INSERT OR REPLACE INTO settings (key, value)
        VALUES (?, ?)
      `
      ).run("youtube_id", youtube_id);
    }

    if (standby_time !== undefined) {
      db.prepare(
        `
        INSERT OR REPLACE INTO settings (key, value)
        VALUES (?, ?)
      `
      ).run("standby_time", String(standby_time));
    }

    io.emit("settings-updated");

    res.json({
      success: true,
    });
  });

  // =========================
  // LIMPAR HISTÓRICO
  // =========================

  app.delete("/api/history", (req, res) => {
    db.prepare("DELETE FROM calls").run();

    io.emit("history-cleared");

    res.json({
      success: true,
    });
  });

  // =========================
  // PDF
  // =========================

  app.get("/api/reports/pdf", (req, res) => {
    const doc = new PDFDocument();

    const filename = `report_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}`
    );

    doc.pipe(res);

    doc.fontSize(25).text(
      "Relatorio de Atendimento - SISCHAM",
      100,
      80
    );

    const rows = db
      .prepare("SELECT * FROM calls ORDER BY timestamp DESC")
      .all();

    let y = 130;

    rows.forEach((row: any) => {
      doc.fontSize(12).text(
        `Senha: ${row.number} - Sala: ${row.counter} - Data: ${row.timestamp}`,
        100,
        y
      );

      y += 20;
    });

    doc.end();
  });

  // =========================
  // EXCEL
  // =========================

  app.get("/api/reports/excel", async (req, res) => {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Chamadas");

    worksheet.columns = [
      {
        header: "ID",
        key: "id",
        width: 10,
      },

      {
        header: "Senha",
        key: "number",
        width: 15,
      },

      {
        header: "Sala",
        key: "counter",
        width: 15,
      },

      {
        header: "Data/Hora",
        key: "timestamp",
        width: 25,
      },
    ];

    const rows = db
      .prepare("SELECT * FROM calls ORDER BY timestamp DESC")
      .all();

    worksheet.addRows(rows);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  });

  // =========================
  // SOCKET.IO
  // =========================

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("call-password", (data) => {
      const { number, counter } = data;
<<<<<<< HEAD
      
      // Save to DB
      const info = db.prepare("INSERT INTO calls (number, counter) VALUES (?, ?)").run(number, counter);
      
=======

      const info = db
        .prepare(
          `
          INSERT INTO calls (number, counter)
          VALUES (?, ?)
        `
        )
        .run(number, counter);

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
      const callData = {
        id: info.lastInsertRowid,
        number,
        counter,
<<<<<<< HEAD
        timestamp: new Date().toISOString()
      };

      // Auto update matching room/counter status to 'busy' (atendendo)
      try {
        db.prepare(`
          UPDATE rooms_doctors 
          SET status = 'busy' 
          WHERE room = ? OR room = ? OR room LIKE ?
        `).run(counter, "Sala " + counter, "%" + counter);
        io.emit("availability-updated");
      } catch (err) {
        console.error("Error setting status to busy on call:", err);
      }

      // Broadcast to all clients (TV and Control)
      io.emit("new-call", callData);
    });

    socket.on("get-availability", () => {
      try {
        const rows = db.prepare("SELECT * FROM rooms_doctors ORDER BY room ASC").all();
        socket.emit("availability-data", rows);
      } catch (err) {
        console.error("Error fetching availability for socket:", err);
      }
    });

    socket.on("update-status", (data) => {
      try {
        const { id, status } = data;
        db.prepare("UPDATE rooms_doctors SET status = ? WHERE id = ?").run(status, id);
        io.emit("availability-updated");
      } catch (err) {
        console.error("Error updating status via socket:", err);
      }
    });

    socket.on("repeat-call", (data) => {
      // Just relay the data to everyone else
=======
        timestamp: new Date().toISOString(),
      };

      io.emit("new-call", callData);
    });

    socket.on("repeat-call", (data) => {
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
      io.emit("repeat-call", data);
    });

    socket.on("settings-updated", () => {
      io.emit("settings-updated");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

<<<<<<< HEAD
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
=======
  // =========================
  // VITE
  // =========================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },

      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

<<<<<<< HEAD
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`SISCHAM Server running at http://localhost:${PORT}`);
  });
}

startServer();
=======
  // =========================
  // START SERVER
  // =========================

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`SISCHAM Server running on port ${PORT}`);
  });
}

startServer();
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
