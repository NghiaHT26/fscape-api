const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authJwt = require('../middlewares/authJwt');
const uploadController = require('../controllers/upload.controller');

/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: Upload file lên Cloudinary (backend kiểm soát folder + giới hạn file)
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload file theo purpose
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - purpose
 *               - files
 *             properties:
 *               purpose:
 *                 type: string
 *                 enum:
 *                   - building_thumbnail
 *                   - building_gallery
 *                   - avatar
 *                   - room_thumbnail
 *                   - room_3d
 *                   - room_blueprint
 *                   - room_gallery
 *                   - contract_pdf
 *                   - request_attachment
 *                   - request_completion
 *                 description: Mục đích upload (quyết định folder + giới hạn số file)
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "File(s) cần upload. Số lượng tùy purpose: thumbnail/avatar/3d/blueprint/contract = 1, gallery = max 5, request = max 3"
 *     responses:
 *       200:
 *         description: Upload thành công
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Khi maxFiles = 1
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     data:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                 - type: object
 *                   description: Khi maxFiles > 1
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     data:
 *                       type: object
 *                       properties:
 *                         urls:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Invalid purpose hoặc vượt giới hạn file
 */
router.post('/', authJwt, upload.array('files', 5), uploadController.upload);

module.exports = router;
