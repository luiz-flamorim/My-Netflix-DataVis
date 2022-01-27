# Netflix - Part II

## Intro
The first part of this project has been posted on my [Behance](https://www.behance.net/gallery/94574457/Netflix-films), as that was my first attempt to code something from my Netflix user data. My goal with the current project is to use it as my portfolio as DataVis designer.

## The Dataset
I started with a simple CSV any Neflix user can download from their own profile. The CSV contains only 2 columns of information: the title of the film and the date the user watched it. Then I used the [TMDB API](https://www.themoviedb.org) to get more information about the films and series. The code has two parts: the Node, which will process the user CSV using the API which generates a JSON; then the second part is the client side which parse the data and builds the diagrams.

## The Processing and treating data
The [TMDB API](https://www.themoviedb.org) offers loads of options, though there are several specifications thats sometimes result in errors. Also, there are many deliberate choices I've done to consolidate the genres, for example: as they are offered as an array, I deliberatey extracted the first value only per item. With a bit of patience, you can get quite a lot of data from it, just bear in mind that there are many end points for different reasons. I my case, I just used the Multisearch, genres and the tv.

## Netflix data
That's a tricky part: currently Netflix doesn't offer an API, as the data must be downloaded from the user profile in the CSV format. There is no normalisation in the dataset, as sometimes you may find 'series 1', or 'season 1', etc. Also the biggest thing is that they don't store (or don't offer the user the download option) of the history, but only the last date recorded on that film or episode. For example, I have many series that I watched all the episodes more than once, although the CSV has only the last date recorded. This is one of the reasons why my year of 2021 has a spike in series, and the previous years have less and less data points. Some of the records also had an empty string with a date, so I manyally deleted those from the CSV. I have also noticed that many records have disappeared from what I remember watching, so you can't trus on that for a very professional query.

## Contributors
My mentor is [Christina Levengood](https://lvngd.com), an amazing software developer who has helped me with this code. She kindly agreed to share her time and witchcraft to teach me how to use Node, D3.

## License
[MIT](https://choosealicense.com/licenses/mit/)
