const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")

const manifest = {
    id: "org.me.meher.subs",
    version: "1.0.0",
    name: "Meher Subs",
    description: "Personal subtitles addon",
    resources: ["subtitles"],
    types: ["series", "movie", "anime"],
    catalogs: [],
    idPrefixes: ["tt"]
}


const builder = new addonBuilder(manifest)

const serieOrAnimer = async (id, extra) => {
    // extra may contain season/episode or videoHash/videoSize depending on content
    if (extra?.season !== undefined) {
        season = extra.season;     // already a number
        episode = extra.episode;  // may be undefined (season pack request)
        imdbId = id
    }
    // Priority 2: Parse from id (always present)
    else {
        const parts = id.split(':');
        imdbId = parts[0];
        season = parts[1] ? parseInt(parts[1], 10) : null;
        episode = parts[2] ? parseInt(parts[2], 10) : null;
    }

    console.log(`sous-tites pour ${imdbId} saison ${season} episode ${episode}`)
    let result = { subtitles: [] }
    if (!season || !episode) {
        return result;
    }

    const s = String(season).padStart(2, "0");
    const e = String(episode).padStart(2, "0");
    const url = `https://raw.githubusercontent.com/meher98/subs/main/${imdbId}/s${s}e${e}.fr.srt`
    res = await fetch(url, { method: "HEAD" })
    if (res.ok) {
        result = {
            subtitles: [
                {
                    id: `${id}-s${s}e${e}-fr`,
                    lang: "fr",
                    url: url
                }
            ]
        };
    }
    return result
}

const movie = async (id) => {
    console.log(`sous-tites pour film ${id}`)
    let result = { subtitles: [] }
    const url = `https://raw.githubusercontent.com/meher98/subs/main/${id}/${id}.fr.srt`
    res = await fetch(url, { method: "HEAD" })
    if (res.ok) {
        result = {
            subtitles: [
                {
                    id: `${id}-fr`,
                    lang: "fr",
                    url: url
                }
            ]
        };
    }
    return result
}

builder.defineSubtitlesHandler(async ({ type, id, extra }) => {
    let result
    if (type === "movie") {
        result = await movie(id)
    } else {
        result = await serieOrAnimer(id, extra)
    }
    return result
});

const PORT = process.env.PORT || 7000

serveHTTP(builder.getInterface(), { port: PORT })
