// initialize infinite scroll
const $campgroundsContainer = $('#campgrounds-container').infiniteScroll({
    // options
    path: function() {
        let pageNumber = this.pageIndex + 1;
        const { totalPages } = pageData;
        if (pageNumber <= totalPages) {
            return `/campgrounds?page=${pageNumber}`;
        }
    },
    status: '.page-load-status',
    scrollThreshold: 100,
    append: '.campgrounds',
    history: false,
});
// fetch json data from server to push data.docs to map source
$campgroundsContainer.on( 'load.infiniteScroll', function( event, body, path, response ) {
    // console.log(`Loaded: ${path}`);
    // console.log(map.getSource('campgrounds'));
    fetch(path, { headers: { 'Accept': 'application/json' } })
        .then(res => res.json())
        .then(data => {
            campgrounds.features.push(...data.docs);
            map.getSource('campgrounds').setData(campgrounds);
        })
        .catch(err => console.log(err));
});
  