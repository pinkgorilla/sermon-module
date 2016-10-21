function test(name, path) {
    describe(name, function () {
        require(path);
    })
}


describe('#sermon-module', function (done) {
    this.timeout(2 * 60000); 
    //Master
    test('@master/sermon-manager', './managers/sermon-manager-test');
})