import sharp from 'sharp'

const source = 'Gemini_Generated_Image_3rzf7d3rzf7d3rzf.png'

await sharp(source).resize(192, 192).toFile('public/icon-192x192.png')
await sharp(source).resize(512, 512).toFile('public/icon-512x512.png')
await sharp(source).resize(180, 180).toFile('public/apple-touch-icon.png')

console.log('Ícones gerados em public/')
