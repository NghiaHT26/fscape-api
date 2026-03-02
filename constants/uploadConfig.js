const UPLOAD_CONFIG = {
  building_thumbnail:    { folder: 'buildings/thumbnails',    maxFiles: 1 },
  building_gallery:      { folder: 'buildings/gallery',       maxFiles: 5 },
  avatar:                { folder: 'users/avatars',           maxFiles: 1 },
  room_thumbnail:        { folder: 'rooms/thumbnails',        maxFiles: 1 },
  room_3d:               { folder: 'rooms/3d',                maxFiles: 1 },
  room_blueprint:        { folder: 'rooms/blueprints',        maxFiles: 1 },
  room_gallery:          { folder: 'rooms/gallery',           maxFiles: 5 },
  contract_pdf:          { folder: 'contracts/pdf',           maxFiles: 1 },
  request_attachment:    { folder: 'requests/attachments',    maxFiles: 3 },
  request_completion:    { folder: 'requests/completions',    maxFiles: 3 },
};

module.exports = { UPLOAD_CONFIG };
