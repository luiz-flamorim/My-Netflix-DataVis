// TO FIX: error on reading series data => the overview is undefined

// activate this block to work on Node
const csv = require('csv-parser')
const fs = require('fs')
const fetch = require("node-fetch");

let apikey = 'api key'

let results = []

fs.createReadStream('/Users/luizamorim/Library/Mobile Documents/com~apple~CloudDocs/Trabalho/2021 NetflixII/data/newdata.csv')
    .pipe(csv({}))
    .on('data', (data) => results.push(data))
    .on('end', () =>
        newDataset(results)
    )

async function newDataset(d) {
    let dataset = []

    let filmsMap = {}

    let genreMap = new Map()
    let genreList = await getGenres()
    genreList.forEach((item) => genreMap.set(item.id, item.name))

    try {
        // for (let i = 0; i < d.length; i++) {
        for (let i = 0; i < 4; i++) {

            let splitted = splitNetflixData(d[i].Title)

            let title = d[i].Title;

            // let chapter = checkChapter(splitted)
            let date = d[i].Date

            let apiResponse = await getApi(title)
            console.log(title, apiResponse)

            if (!apiResponse) {
                let overview = 'Not available'
                let poster = 'Not available'
                let genre = ['Not available']
                let language = 'Not available'
                let type = 'Not available'

                dataset.push(new film(title, chapter, date, type, overview, poster, genre, language))

            } else {

                filmsMap[title] = {
                    overview: await apiResponse.overview,
                    poster: 'https://image.tmdb.org/t/p/w200/' + await apiResponse.poster_path
                }

                // let overview = await apiResponse.overview
                // let poster = 'https://image.tmdb.org/t/p/w200/' + await apiResponse.poster_path

                // let genre = await apiResponse.genre_ids
                // for (let i = 0; i < genre.length; i++) {
                //     genre[i] = genreMap.get(genre[i])
                // }

                // if (genre == '' | genre == null | genre == [''] | genre == undefined) {
                //     genre = ['Not available']
                // }

                // const language = await apiResponse.original_language
                // let type = 'film'
                // dataset.push(new film(title, chapter, date, type, overview, poster, genre, language))
                
            } 
            
            // else {
            //     let overview = await apiResponse.overview
            //     let poster = 'https://image.tmdb.org/t/p/w200/' + await apiResponse.poster_path

            //     let genre = await apiResponse.genre_ids
            //     for (let i = 0; i < genre.length; i++) {
            //         genre[i] = genreMap.get(genre[i])
            //     }
            //     if (genre == '' | genre == null | genre == [''] | genre == undefined) {
            //         genre = ['Not available']
            //     }

            //     let language = await apiResponse.original_language
            //     let type = 'series'
            //     dataset.push(new film(title, chapter, date, type, overview, poster, genre, language))
            // }
        }

        //     // activate this block to work on Node
        // fs.writeFileSync('./results2.json', JSON.stringify(dataset, null, '\t'));
        console.log(filmsMap)

    } catch (error) {
        console.log(`Error => ${error}`)
    }
}

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

async function getApi(query) {
    try {
        let url = encodeURI(`https://api.themoviedb.org/3/search/multi?${apikey}&query=${query}`)

        let getUrl = await fetch(url)
            .then(res => res.json())
            .then(data => data.results[0])
        return getUrl
    } catch (error) {
        console.log(error)
    }
}

async function getGenres() {
    try {

        let films = encodeURI(`https://api.themoviedb.org/3/genre/movie/list?${apikey}`)
        let series = encodeURI(`https://api.themoviedb.org/3/genre/tv/list?${apikey}`)

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

function translateGenre(item, list) {
    for (let i = 0; i < list.length; i++) {
        if (item == list[i].id) {
            return list[i].name
        }
    }
}