const path = require("path");
const fs = require("fs");
const multer = require("multer");

const BASE_STORAGE_DIR = path.join(__dirname, "..", "..", "storage", "cv");

if (!fs.existsSync(BASE_STORAGE_DIR)) {
  fs.mkdirSync(BASE_STORAGE_DIR, { recursive: true });
}

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function sanitizeName(value) {
  return String(value || "inconnu")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const nom = sanitizeName(req.body.nom);
    const prenom = sanitizeName(req.body.prenom);
    const folder = `${nom}_${prenom}`;
    const dest = path.join(BASE_STORAGE_DIR, folder);
    fs.mkdirSync(dest, { recursive: true });
    req._cvFolder = folder;
    cb(null, dest);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cv${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    const err = new Error("Seuls les fichiers PDF, DOC et DOCX sont acceptes");
    err.statusCode = 400;
    return cb(err, false);
  }
  return cb(null, true);
}

const uploadCv = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { uploadCv, BASE_STORAGE_DIR };
