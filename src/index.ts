import HTTPStatusCode from "http-status-code"
import statusEmojis from 'http-status-emojis'
import ejs from 'ejs'
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
const selectedStatusCodes = [
    401, 408, 415, 424, 501, 508, 402,
    409, 416, 426, 502, 510, 403, 410,
    417, 428, 503, 511, 404, 411, 418,
    429, 504, 405, 412, 421, 431, 505,
    406, 413, 422, 451, 506, 407, 414,
    423, 500, 507
  ]
  interface StatusObject {
    status: number
    status_emoji: string 
    status_message: string 
  }
  const code_data = selectedStatusCodes.map((code) => ({
    status: code,
    status_emoji: Buffer.from(statusEmojis[code]).toString('base64'),
    status_message: HTTPStatusCode.getMessage(code)
  })) as StatusObject[]
//   console.log(code_data)

if(process.env.SERVE_CODES) {
    Bun.serve({
        port: 3000,
        async fetch(req) {
          const filePath = new URL(req.url).pathname.slice(1);
const template = await Bun.file(join(__dirname, 'template.ejs')).text()

        //   const file = Bun.file(filePath);
        //@ts-ignore
        if(isNaN(filePath)) {
            return new Response('Invalid path', { status: 403 })
        }
        const data = code_data.find(d => d.status == parseFloat(filePath))
        if(!data) {
            return new Response('not found FR.', { status: 404 })
        } else {
          return new Response(ejs.render(template, data), {
            "headers": {
                "Content-Type": "text/html",
            }
          });
        }
        },
        error(e) {
            console.error(e)
          return new Response(null, { status: 500 });
        },
      });
      console.log(`Up on http://localhost:3000`)
} else if (process.env.BUILD_CODES) {
const template = await Bun.file(join(__dirname, 'template.ejs')).text()

    if(!existsSync(join(__dirname, 'statuses'))) {
        mkdirSync(join(__dirname, 'statuses'))
    }
    for (const d of code_data)  {
        console.log(`Writing code: ${d.status_emoji} ${d.status} - ./statuses/${d.status}.html ...`)
        // const file = await Bun.file(``)
        const out = ejs.render(template, d)
        Bun.write(join(__dirname, 'statuses', `${d.status}.html`), out)
    }
} else {
    console.log(`You forgot to select an option, use env to set if building or serving codes`)
}
// Bun.write('./e', )