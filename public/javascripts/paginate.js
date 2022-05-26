// initialize infinite scroll
const $campgroundsContainer = $('#campgrounds-container').infiniteScroll({
    // options
    path: function() {
        let pageNumber = this.pageIndex + 1;
        const { totalPages } = data;
        if (pageNumber <= totalPages) {
            return `/campgrounds?page=${pageNumber}`;
        }
    },
    status: '.page-load-status',
    scrollThreshold: 100,
    append: '.campgrounds',
    history: false,
});