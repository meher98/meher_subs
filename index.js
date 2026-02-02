const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")

const manifest = {
    id: "org.me.meher.subs",
    version: "1.0.0",
    name: "My Subtitles",
    description: "Personal subtitles addon",
    resources: ["subtitles"],
    types: ["series", "movie", "anime"],
    catalogs: [],
    idPrefixes: ["tt"]
}

const builder = new addonBuilder(manifest)

function pad(n) {
    return String(n).padStart(2, "0")
}

builder.defineSubtitlesHandler(async ({ id, extra }) => {
    const { season, episode } = extra || {}
    if (!season || !episode) return { subtitles: [] }

    const s = pad(season)
    const e = pad(episode)

    return {
        subtitles: [
            {
                id: `${id}-s${s}e${e}-fr`,
                lang: "fr",
                url: `https://raw.githubusercontent.com/meher98/subs/refs/heads/main/${id}/s${s}e${e}.fr.srt`
            }
        ]
    }
})

const PORT = process.env.PORT || 7000

serveHTTP(builder.getInterface(), { port: PORT })
