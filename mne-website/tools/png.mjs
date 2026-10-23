// Minimal PNG decoder (8-bit RGB / RGBA, non-interlaced) for tools/check.mjs.
import { inflateSync } from "node:zlib";

export const PNG = {
  decode(buf) {
    let p = 8, w = 0, h = 0, type = 0;
    const idat = [];
    while (p < buf.length) {
      const len = buf.readUInt32BE(p), tag = buf.toString("ascii", p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
      if (tag === "IHDR") {
        w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9];
        if (data[8] !== 8 || ![2, 6].includes(type) || data[12]) throw new Error("unsupported PNG");
      } else if (tag === "IDAT") idat.push(data);
      p += 12 + len;
    }
    const bpp = type === 6 ? 4 : 3, stride = w * bpp, raw = inflateSync(Buffer.concat(idat));
    const out = Buffer.alloc(stride * h);
    for (let y = 0; y < h; y++) {
      const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? out[dst + x - bpp] : 0, b = y ? out[dst - stride + x] : 0, c = x >= bpp && y ? out[dst - stride + x - bpp] : 0;
        let v = raw[src + x];
        if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
        else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
        out[dst + x] = v & 255;
      }
    }
    return { width: w, height: h, pixel(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return null;
      const i = y * stride + x * bpp; return [out[i], out[i + 1], out[i + 2]];
    } };
  },
};
