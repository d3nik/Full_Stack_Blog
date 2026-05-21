import fs from 'fs';
import path from 'path';

export const deleteImage = (imageUrl) => {
    if (!imageUrl) return;
    
    const filename = path.basename(imageUrl);
    const filepath = path.join('uploads', filename);
    
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
};