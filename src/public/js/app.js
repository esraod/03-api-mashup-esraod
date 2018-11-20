class Mashed {

    constructor() {
        this.search = this.search.bind(this);

        this.initialize();
        this.addEventListeners();
    }


    initialize() {
        // Egenskaper för instanser av den här klassen, används för att referera till samma Node/Element i DOM.
        this.sentinel = document.querySelector('.sentinel');
        this.searchInput = document.querySelector('.search input');
        this.searchBtn = document.querySelector('.search button');
        this.sgstWords = document.querySelectorAll('div#sgst ul');
        this.searchResultsContainer = document.querySelector('.results ul');

        // Frivilligt: för att visa en laddningsindikator!
        this.loadingIndicator = document.querySelector('.loader');
    }


    //Method that sets up our eventlisteners
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

    
    /*
        1) Bygg upp en array med anrop (promise) till fetchFlickrPhotos och fetchWordlabWords med searchString
        Notera: att ordningen du skickar in dessa i spelar roll i steg 3)
        2) Använd Promise.all för att hantera varje anrop (promise)
        2 a) then(results) => Om varje anrop lyckas och varje anrop returnerar data

        3) För varje resultat i arryen results, visa bilder från FlickR or ord från WordLab.
        4 results[0] kommer nu innehålla resultat från FlickR och results[1] resultat från WordLab.
        5 skapa element och visa dem i DOM:en med metoderna (renderFlickResults och renderWordlabResults)

        2 b) catch() => Om något anrop misslyckas, visa felmeddelande
    */

    /**
    * Method (used as a callback) to handle searches
    *
    * @param {*} event Det event som gjorde att denna callback anropades
    * @param {*} [searchString=null] Den söksträng som användaren matat in i fältet, är null by default
    */
    search(event, searchString = null) {
        event.preventDefault();

        // Om söksträngen inte är tom och är definierad så ska vi söka
        if (this.checkSearchInput(searchString)) {
            // Console loggar det vi sökt på som kommer trigga sökningen etc.
            console.log(`Trigga sökning med ${searchString}`);


            // 1) Array med anrop(promise) till de två fetch'n 
            const resultArray = [this.fetchFlickrPhotos(searchString),this.fetchWordlabWords(searchString)];


            // 2) Promise.all för att hantera anrop(promoise)
            Promise.all(resultArray)
            
            //2a) then(resuluts) => om varje anrop lyckas och anropen retunerar data
            .then(results => {
                //this.fetchFlickrPhotos(results[0]);
                //this.fetchWordlabWords(results[1]);
                //console.log("working console in my Promise.all"); 
                //console.log(results);
                console.log(results[1].status)
                //console.log(results[1])
                //console.log(results[1].json())
                //return Promise.all([results[0].json(), results[1].json()]); 
                if (results[0].status === 200 && results[1].status === 200) {
                    return Promise.all([results[0].json(), results[1].json()]);;
                } else if (results[0].status === 200) {
                    return Promise.all([results[0].json()]);
                } 
            })

            .then(data =>{ 
               this.renderFlickrResults(data[0]);
               document.querySelector("div#sgst ul").innerText="";
               //this.renderWordlabResults(data[1]);
                if (data[1]){
                    this.renderWordlabResults(data[1]);
                }
               console.log(data[0]);
            })

            //  3) För varje resultat i arryen results, visa bilder från FlickR or ord från WordLab.

            // 4) results[0] kommer nu innehålla resultat från FlickR och results[1] resultat från WordLab.

            // 5) skapa element och visa dem i DOM:en med metoderna (renderFlickResults och renderWordlabResults)

            // 2b) catch() => Om något anrop misslyckas visa felmedelande


            .catch( err => {
                //alert("nothing matched");
                this.searchResultsContainer.innerHTML ="";
                this.searchResultsContainer.insertAdjacentHTML('afterbegin','<li class="result"> <p>Noting matched your search,</br> <span id="yellowtag">try search something else</span></p></li>');
                this.searchInput.value="";
               
                
            });
           /* .catch(() => {

                //alert("nothing matched");
                
                //this.searchResultsContainer.innerHTML ="";
                //this.searchResultsContainer.insertAdjacentHTML('afterbegin','<li class="result"> <p>Noting matched your search,</br> <span id="yellowtag">try search something else</span></p></li>');
                //this.searchInput.value="";
                
                
            
            });
            */
        

        } else {
            // Om söksträngen iär tom och inte definierad
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
    fetchFlickrPhotos(searchString){
        let flickrAPIkey = `42e291bad00fd4332215d3336cc52534`; // Din API-nyckel här
        let flickerAPIRootURL = `https://api.flickr.com/services/rest/?`; // Grundläggande delen av Flickr's API URL

        // Olika sökparametrar som behövs för Flickr's API. För mer info om detta kolla i Flickrs API-dokumentation
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
        let wordLabAPIkey = `31da8b2236a3ad990c9707422568cee5`; // Din API-nyckel här
        let wordLabURL = `http://words.bighugelabs.com/api/2/${wordLabAPIkey}/${searchString}/json`;

        return fetch(wordLabURL);
    }


    /**
     * Metod som skapar bild-element och relaterade element för varje sökresultat mot Flickr
     *
     * @param {Object} data Sökresultaten från Flickr's API.
     */
    renderFlickrResults(data) { 
        this.searchResultsContainer.innerHTML ="";
        for (let i = 0; i < 15; i++){
            this.searchResultsContainer.insertAdjacentHTML('afterbegin', `<a href="https://www.flickr.com/photos/${data.photos.photo[i].owner}/${data.photos.photo[i].id}/" target="_blank"><img src="https://farm${data.photos.photo[i].farm}.staticflickr.com/${data.photos.photo[i].server}/${data.photos.photo[i].id}_${data.photos.photo[i].secret}_m.jpg"></a>`)
        }; 
        
    }
    


    /**
     * Metod som skapar ord-element för relaterade sökord som kommer från Wordlabs API
     *
     * @param {Object} data Sökresultaten från Flickr's API.
     */
    renderWordlabResults(data) {
        //this.sgstWords.innerHTML="";
        document.querySelector("div#sgst ul").innerText="";
        console.log(data);
        
        for (let i = 0; i < 3; i++){
            if (data.noun.syn[i].length > 0){   
                document.querySelector("div#sgst ul").insertAdjacentHTML('afterbegin', `<li><a href="#">${data.noun.syn[i]}</a></li>`);
            }
           
            
            //this.sgstWords.insertAdjacentHTML =('afterbegin', `<li><a href="#">${data.noun.syn[i]}</a></li>`)
            //document.querySelector("div#sgst ul").insertAdjacentHTML('afterbegin', `<li><a href="#">${data.noun.syn[i]}</a></li>`);
        }; 
       
    }

}
   


// Immediately-Invoked Function Expression, detta betyder att när JS-filen läses in så körs koden inuti funktionen nedan.
(function() {
    new Mashed();
})();
