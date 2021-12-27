# Netflix - Part II

## Intro
The first part of this project has been posted on my [Behance](https://www.behance.net/gallery/94574457/Netflix-films), as that was my first attempt to code something from my Netflix user data. I have first used Processing on that, as there was just 2 data points about the films I watched: titles and dates. My goal with the current project is to use it as my portfolio as DataVis designer.

## The Dataset
I started with a simple CSV any Neflix user can download from their profile. The CSV contains only 2 columns of information: the title of the film and the date the user watched it. Then I used the [TMDB API](https://www.themoviedb.org) to get more information about the films and series. The code has two parts: the Node, which will build a more robust dataset from the user data and the API, structuring it on a JSON; then the second part is the client side which parse the data and builds the diagrams.

## Contributors
My mentor is [Christina Levengood](https://lvngd.com), an amazing software developer who has helped me with this code. She kindly agreed to share her time and witchcraft to teach me use D3.

## Client and Node
In the app.js you will notice some duplications and comments about the Client and Node. I decided to generate an JSON from my data, instead of loading the data and running the API, hence I used Node. Although it might be a case of using the same code with a smaler dataset to the client side only - so I decided to leave it commented in case anyone would like to get the code working on the client side.

On the Node, you will need to install some modules from npm, and require them, and also use a method to avoid Type Errors:

```javascript

//requests
const csv = require('csv-parser')
const fs = require('fs')
const fetch = require("node-fetch");

// module for the URL requests:
encodeURI()
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
