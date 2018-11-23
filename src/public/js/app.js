class Mashed {

    constructor() {
        this.search = this.search.bind(this);

        this.initialize();
        this.addEventListeners();
    }


    initialize() {
        this.sentinel = document.querySelector('.sentinel');
        this.searchInput = document.querySelector('.search input');
        this.searchBtn = document.querySelector('.search button');
        this.sgstWords = document.querySelectorAll('div#sgst ul');
        this.searchResultsContainer = document.querySelector('.results ul');

        // loading indicator (--not using this--)
        this.loadingIndicator = document.querySelector('.loader');
    }


    //Method that sets up the eventlisteners
    addEventListeners() {

        // Event listener to the search button
        this.searchBtn.addEventListener('click', event =>
        this.search(event, this.searchInput.value)
        );

        //Eventlistener for all words in sgst
        this.sgstWords.forEach(wordEl =>
        wordEl.addEventListener('click', event =>
        this.search(event, event.target.textContent)
        )
        );
    }


    /**
    * Method (used as a callback) to handle searches
    *
    * @param {*} event Det event som gjorde att denna callback anropades
    * @param {*} [searchString=null] Den söksträng som användaren matat in i fältet, är null by default
    */

    search(event, searchString = null) {
        event.preventDefault();

        // If the search string is not empty and is defined then we are going to search
        if (this.checkSearchInput(searchString)) {
            // Console logging what has been searched for (what is going to trig the search etc.)
            console.log(`Trigg the search with ${searchString}`);
            // Shows what is searched for (Added this for making the user able to see what they recently searched for if the search was from clicking on a suggestion).
            this.searchInput.value=(`${searchString}`);

            // Array with promise to the two fetch's
            const resultArray = [this.fetchFlickrPhotos(searchString),this.fetchWordlabWords(searchString)];

            // Promise.all for handle promise
            Promise.all(resultArray)
            
            // Then (results) => If each call succeeds and the call returns data
            .then(results => {

                if (results[0].status === 200 && results[1].status === 200) {
                    return Promise.all([results[0].json(), results[1].json()]);;
                } else if (results[0].status === 200) {
                    return Promise.all([results[0].json()]);
                } 
            })

            // Then (data) 
            .then(data => { 

               this.renderFlickrResults(data[0]);

               // Clears the previous suggestions
               document.querySelector("div#sgst ul").innerText="";
            
               if (data[1]) {
                   this.renderWordlabResults(data[1]);
                }

            })

            // If any search failes (no related photos is found)
            .catch( err => {
                // Clears the suggestions (seeing nothing of the previous suggestions)
                document.querySelector("div#sgst ul").innerText="";
                // Sets attribute style to 1 column-count
                document.querySelector(".results ul").setAttribute('style', "column-count: 1;")
                // Clears the inside of the search result container (Like previous results.)
                this.searchResultsContainer.innerHTML ="";
                // Adds the list item with the Message telling nothing was found (search for something else)
                this.searchResultsContainer.insertAdjacentHTML('afterbegin','<li class="result"> <p>Noting matched your search,</br> <span id="yellowtag">try search for something else</span></p></li>');
                // Clears the input 
                this.searchInput.value="";
            });
        
        // Else
        } else {
            // If the seach string is empty
            // -- Not used --
            console.log(
            `Söksträngen är tom, visa ett meddelande eller bara returnera`
            );
            return;
        }

    }


  /**
   * Metod som används för att kolla att söksträngen är giltig
   *
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns Boolean (true/false)
   */


    checkSearchInput(searchString) {
        return searchString && searchString.trim().length > 0;
    }


  /**
   *  Metod som används för att göra API-anrop till Flickr's API för att få bildresultat.
   *
   * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns {Promise} Ett fetch() Promise
   */


    fetchFlickrPhotos(searchString) {

        let flickrAPIkey = `42e291bad00fd4332215d3336cc52534`; // API - Key
        let flickerAPIRootURL = `https://api.flickr.com/services/rest/?`;

        // Different search parameters needed for Flickr's API. For more information about this check out the Flickr API-documentation
        let flickrQueryParams = `&method=flickr.photos.search&api_key=${flickrAPIkey}&text=searchString&extras=url_q, url_o, url_m&format=json&tags=${searchString}&license=2,3,4,5,6,9&sort=relevance&parse_tags=1&nojsoncallback=1`;
        let flickrURL = `${flickerAPIRootURL}${flickrQueryParams}`;

        return fetch(flickrURL);
    };


  /**
   * Metod som används för att göra API-anrop till wordlab API:et för att få förslag på andra söktermer
   *
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns {Promise} Ett fetch() Promise
   */
  
    fetchWordlabWords(searchString) {
        let wordLabAPIkey = `31da8b2236a3ad990c9707422568cee5`; // API - Key
        let wordLabURL = `http://words.bighugelabs.com/api/2/${wordLabAPIkey}/${searchString}/json`;

        return fetch(wordLabURL);
    }


    /**
     * Metod som skapar bild-element och relaterade element för varje sökresultat mot Flickr
     *
     * @param {Object} data Sökresultaten från Flickr's API.
    */

    renderFlickrResults(data) { 

        // Clears the search result container
        this.searchResultsContainer.innerHTML ="";

        // "Removes" the Style attribute for the results ul (used to remove column-count 1, which is used in the start and in the catch).
        document.querySelector(".results ul").setAttribute('style', "");
    
        // Loops 15 photos from Flickr
        for (let i = 0; i < 15; i++){
            // Loops 15 photos wrapped inside of an a-tag(link) which is making the user able to click and open the photo on Flickr 
            this.searchResultsContainer.insertAdjacentHTML('afterbegin', `<a href="https://www.flickr.com/photos/${data.photos.photo[i].owner}/${data.photos.photo[i].id}/" target="_blank"><img src="https://farm${data.photos.photo[i].farm}.staticflickr.com/${data.photos.photo[i].server}/${data.photos.photo[i].id}_${data.photos.photo[i].secret}_c.jpg"></a>`)
        }; 
        
    }
    

    /**
     * Metod som skapar ord-element för relaterade sökord som kommer från Wordlabs API
     *
     * @param {Object} data Sökresultaten från Flickr's API.
    */

    renderWordlabResults(data) {
        
        // Clears the previous suggestions
        document.querySelector("div#sgst ul").innerText="";
        
        // Loops 3 suggestions (synonyms) for the searched string
        for (let i = 0; i < 3; i++){
            if (data.noun.syn[i].length > 0){   
                document.querySelector("div#sgst ul").insertAdjacentHTML('afterbegin', `<li><a href="#">${data.noun.syn[i]}</a></li>`);
            }
        }; 
       
    }

}
   


// Immediately-Invoked Function Expression, detta betyder att när JS-filen läses in så körs koden inuti funktionen nedan.
(function() {
    new Mashed();
})();
