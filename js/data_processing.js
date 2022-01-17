// TO FIX: error on reading series data => the overview is undefined
// add to read me: document how I cleaned the dataset
// add to read me Netflix doesn't store all the plays of the series, but only the last one = doesn't store the duplicates
// work on the Legend: reduce the number of categories
// fix the title on the CSS - movie title on the card
// fix the duration/ animation/ delay => animation problem

require('dotenv').config()
const csv = require('csv-parser')
const fs = require('fs')
const fetch = require("node-fetch")

let apikey = process.env.API_KEY

let results = []
let allFilmsAndSeries = []
let titleError

fs.createReadStream('/Users/luizamorim/Library/Mobile Documents/com~apple~CloudDocs/Trabalho/2021 NetflixII/data/newdata.csv')
    .pipe(csv({}))
    .on('data', (data) => results.push(data))
    .on('end', () =>
        newDataset(results)
    )

async function newDataset(d) {

    try {
        let genreList = await genreMap()

        for (let i = 0; i < d.length; i++) {
            // for (let i = 0; i < 300; i++) {
            titleError = d[i]
            console.log(`${i} of ${d.length} => ${treatTitle(d[i].Title)}`)

            let filmOrSerie
            let date = d[i].Date

            let titleArray = treatTitle(d[i].Title)
            let title = titleArray[0]

            if (!title.includes(' : ') | title != '' | title != ' ') {

                let apiResponse = await getApi(title)

                if (!apiResponse) {
                    filmOrSerie = {
                        title: title,
                        date: date,
                        chapter: 'Not available',
                        overview: 'Not available',
                        poster: 'Not available',
                        genre: 'Not available',
                        language: 'Not available',
                        type: 'Not available',
                        id: 'Not available'
                    }

                } else {

                    let genre = await apiResponse.genre_ids
                    if (genre == '' | genre == null | genre == [''] | genre == undefined) {
                        genre = ['Not available']
                    } else {
                        for (let i = 0; i < genre.length; i++) {
                            genre[i] = genreList.get(genre[i])
                        }
                    }

                    let chapter = 'Not available'
                    if (titleArray.length > 1) {
                        chapter = titleArray.slice(-1)[0]
                    }

                    let overview = await apiResponse.overview
                    let poster = 'https://image.tmdb.org/t/p/w200/' + await apiResponse.poster_path
                    let language = await apiResponse.original_language
                    let type = await apiResponse.media_type
                    let id = await apiResponse.id


                    if (type == 'tv') {
                        let chapterInfo = await getTvSeriesInfo(id)
                        overview = chapterInfo
                    }

                    filmOrSerie = {
                        title: title,
                        date: date,
                        chapter: chapter,
                        overview: overview,
                        poster: poster,
                        genre: genre[0],
                        language: language,
                        type: type,
                        id: id
                    }

                }
                // console.log(filmOrSerie)
                allFilmsAndSeries.push(filmOrSerie)
            }

        }
        let fileName = './updated-list.json'
        fs.writeFileSync(fileName, JSON.stringify(allFilmsAndSeries, null, '\t'));
        console.log(`The new dataset is ready: on ${fileName}`)

    } catch (error) {
        console.log(`Error on ${titleError} => ${error}`)
    }
}





function treatTitle(string) {
    if (string.includes(': Season')) {
        let seriesTitle = string.split(': ')
        return seriesTitle
    } else {
        return [string]
    }
}

async function getApi(query) {
    try {
        let url = encodeURI(`https://api.themoviedb.org/3/search/multi?api_key=${apikey}&query=${query}`)
        let getUrl = await fetch(url)
            .then(res => res.json())
            .then(data => data.results[0])
        return getUrl
    } catch (error) {
        console.log(error)
    }
}

async function getTvSeriesInfo(query) {
    try {
        let url = encodeURI(`https://api.themoviedb.org/3/tv/${query}?api_key=${apikey}`)
        let getUrl = await fetch(url)
            .then(res => res.json())
            .then(data => data.last_episode_to_air.overview)
        return getUrl
    } catch (error) {
        console.log(error)
    }

}

async function genreMap() {
    let genreMap = new Map()
    let genreList = await getApiGenres()
    genreList.forEach((item) => genreMap.set(item.id, item.name))
    return genreMap
}

async function getApiGenres() {
    try {

        let films = encodeURI(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apikey}`)
        let series = encodeURI(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apikey}`)

        let filmsGenre = await fetch(films)
            .then(res => res.json())
            .then(data => {
                return data.genres
            })

        let seriesGenre = await fetch(series)
            .then(res => res.json())
            .then(data => {
                return data.genres
            })
        let allGenres = filmsGenre.concat(seriesGenre)
        return allGenres
    } catch (error) {
        console.log(error)
    }
}


// previous data structure
// function film(title, chapter, date, type, overview, poster, genre, language) {
//     this.title = title
//     this.chapter = chapter
//     this.date = date
//     this.type = type
//     this.overview = overview
//     this.poster = poster
//     this.genre = genre
//     this.language = language
// }