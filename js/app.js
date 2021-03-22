const csv = require('csv-parser')
const fs = require('fs')
const results = []

fs.createReadStream('/Users/luizamorim/Desktop/NetflixII/data/NetflixViewingHistory.csv')
    .pipe(csv({}))
    .on('data', (data) => results.push(data))
    .on('end', () =>
        // console.log('csv parsed')
        newDataset(results)
    )


//CLIENT side - working fine
// const filmData = d3.csv("/data/NetflixViewingHistory.csv")
//     .then(data =>
//          newDataset(data) 
//     );
//     console.log(filmData);

async function newDataset(d) {
    let dataset = []
    try {
        for (let i = 0; i < d.length; i++) {
            let genreMap = new Map()
            const genreList = await getGenres()
            genreList.forEach((item) => genreMap.set(item.id, item.name))

            const splitted = splitNetflixData(d[i].Title)
            const title = splitted[0];
            const chapter = checkChapter(splitted)
            const date = d[i].Date

            let apiResponse = await getApi('tv', title)
            if (!apiResponse) {
                const overview = 'Not available'
                const poster = 'Not available'
                const genre = 'Not available'
                const language = 'Not available'
                let type = 'Not available'
                dataset.push(new film(title, chapter, date, type, overview, poster, genre, language))
            } else if (apiResponse == undefined) {
                apiResponse = await getApi('movie', title)
                const overview = await apiResponse.overview
                const poster = 'https://image.tmdb.org/t/p/w200/' + await apiResponse.poster_path

                let genre = await apiResponse.genre_ids
                for (let i = 0; i < genre.length; i++) {
                    genre[i] = genreMap.get(genre[i])
                }

                const language = await apiResponse.original_language
                let type = 'film'
                dataset.push(new film(title, chapter, date, type, overview, poster, genre, language))
            } else {
                const overview = await apiResponse.overview
                const poster = 'https://image.tmdb.org/t/p/w200/' + await apiResponse.poster_path

                let genre = await apiResponse.genre_ids
                for (let i = 0; i < genre.length; i++) {
                    genre[i] = genreMap.get(genre[i])
                }

                const language = await apiResponse.original_language
                let type = 'series'
                dataset.push(new film(title, chapter, date, type, overview, poster, genre, language))
            }
        }
        return dataset
    } catch (error) {
        console.log('Error: ' + error)
    }
}

function film(title, chapter, date, type, overview, poster, genre, language) {
    this.title = title
    this.chapter = chapter
    this.date = date
    this.type = type
    this.overview = overview
    this.poster = poster
    this.genre = genre
    this.language = language
}

function splitNetflixData(e) {
    let splitted
    if (e.includes(':')) {
        splitted = e.split(':')
    } else {
        splitted = [e]
    }
    return splitted
}

function checkChapter(d) {
    let chapter
    if (d[2]) {
        chapter = d[2].trim()
    } else {
        chapter = 'null'
    }
    return chapter
}

async function getApi(type, d) {
    let searchType = type
    try {
        const url = `https://api.themoviedb.org/3/search/${searchType}?${apikey}&query=${d}`
        const getUrl = await fetch(url)
            .then(res => res.json())
            .then(data => {
                return data.results[0]
            })
        return getUrl
    } catch (error) {
        console.log(error)
    }
}

async function getGenres() {
    try {
        const films = `https://api.themoviedb.org/3/genre/movie/list?${apikey}`
        const series = `https://api.themoviedb.org/3/genre/tv/list?${apikey}`
        const filmsGenre = await fetch(films)
            .then(res => res.json())
            .then(data => {
                return data.genres
            })
        const seriesGenre = await fetch(series)
            .then(res => res.json())
            .then(data => {
                return data.genres
            })
        const allGenres = filmsGenre.concat(seriesGenre)
        return allGenres
    } catch (error) {
        console.log(error)
    }
}

function translateGenre(item, list) {
    for (let i = 0; i < list.length; i++) {
        if (item == list[i].id) {
            return list[i].name
        }
    }
}