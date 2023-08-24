module.exports = (req, res) => {
    response.json({
        body: req.body,
        query: req.query,
        cookies: req.cookies,
        
    });
}