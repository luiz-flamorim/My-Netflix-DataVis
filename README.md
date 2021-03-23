# Netflix - Part II

## Intro
The first part of this project is posted on my [Behance](https://www.behance.net/gallery/94574457/Netflix-films), as that was my first attempt to build something from code. I used Java in the processing environment to bring my Netflix data to life. At that first moment I just had 2 data points about the films I watched: title and date. i believe now I have a bit more maturity to code something a bit more complex and interactive. I

## The Dataset
I started with a simple CSV any Neflix user can download from their profile. The CSV contains only 2 columns of information: the title of the film and the date the user watched it. I used the [TMDB API](https://www.themoviedb.org) to get more information about the films and series. I

## Contributors
My mentor is [Christina Levengood](https://lvngd.com), an amazing software developer who has helped me with this code.

# Client and Node
In the app.js you will notice some duplications and comments about the Client and Node. I decided to generate an JSON from my data, instead of loading the data and running the API, hence I used Node. Although it might be a case of using the same code with a smaler dataset to the client side only.

On the Node, you will need to install some modules from npm, and require them, and also use a method to avoid Type Errors:

```python
//requests
const csv = require('csv-parser')
const fs = require('fs')
const fetch = require("node-fetch");
// module for the URL requests:
encodeURI(
```

## License
[MIT](https://choosealicense.com/licenses/mit/)