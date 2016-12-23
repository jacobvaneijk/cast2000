/**
 * GET /
 *
 * This is the home page; all magic happens here.
 */
exports.index = function(req, res) {
    res.render('index.html', {
        title: 'Cast2000'
    });
};
