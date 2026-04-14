const path = require("path");
const fs = require("fs");
const multer = require("multer");

const BASE_DIR = path.join(__dirname, "..", "..", "storage", "candidatures");

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTS = new Set([".pdf", ".doc", ".docx"]);

const MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const userId = req.auth?.user_id || "unknown";
    const dest = path.join(BASE_DIR, String(userId));
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = file.fieldname === "lettre" ? "lettre" : "cv";
    cb(null, `${base}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
    const err = new Error("Seuls les fichiers PDF, DOC et DOCX sont acceptes");
    err.statusCode = 400;
    return cb(err, false);
  }
  return cb(null, true);
}

const uploadCandidature = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = { uploadCandidature, BASE_DIR };
