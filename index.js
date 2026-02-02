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

builder.defineSubtitlesHandler(async ({ type, id, extra }) => {
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

    if (!season || !episode) {
        return { subtitles: [] };
    }

    const s = String(season).padStart(2, "0");
    const e = String(episode).padStart(2, "0");

    return {
        subtitles: [
            {
                id: `${id}-s${s}e${e}-fr`,
                lang: "fr",
                url: `https://raw.githubusercontent.com/meher98/subs/main/${id}/s${s}e${e}.fr.srt`
            }
        ]
    };
});

const PORT = process.env.PORT || 7000

serveHTTP(builder.getInterface(), { port: PORT })
