window.TestRunner = (function() { // protect the lemmings!

    function request(path = null, type = "GET") {
        return new Promise((resolve, reject) => {
            if (path === null) {
                reject('no path set');
                return;
            }

            const xhr = new XMLHttpRequest();
            xhr.open(type, path);
            xhr.onload = (e) => {
                resolve(e);
            };
            xhr.onerror = (err) => {
                reject(err);
            };
            xhr.send();
        });
    } // request

    function loadCSS(path = null) {
        if (path === null) {
            throw new Error('path not set');
            return;
        }

        return request(path).then((data) => {
            const {currentTarget} = data;
            const {responseURL} = currentTarget;

            const head  = document.querySelector('head');
            const link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = responseURL;
            link.media = 'all';
            head.appendChild(link);

            return true;
        });
    
    } // loadCSS

    function loadScript(path = null) {
        if (path === null) {
            throw new Error('path not set');
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.setAttribute('src', path);
            script.onload = () => {
                console.log('loaded', path);
                resolve(true);
            };
            script.onerror = () => {
                reject(true);
            };
            document.body.appendChild(script);
        });
    } // loadScript

    function loadMocha(type = 'bdd', globals = [], promiseFunc = null) {
        return new Promise((resolve, reject) => {
            if (promiseFunc === null || typeof promiseFunc !== "function") {
                reject('no promise object given');
                return;
            }

            const htmlStr = `
<div>
    <a href="#" class="js-toggle">minimize</a>
    <div id='mocha'></div>
</div>
            `;
            const div = document.createElement('div');
            div.innerHTML = htmlStr;
            const firstChild = document.body.childNodes[0];
            document.body.insertBefore(div, firstChild);
            document.body.querySelector('.js-toggle').addEventListener('click', (e) => {
                e.preventDefault();
                e.target.parentNode.style.height = 0;
                e.target.parentNode.style.overflow = 'hidden';
                e.target.parentNode.querySelector('#mocha').style.display = 'none';
            });

            mocha.setup('bdd')
            mocha.checkLeaks();
            mocha.globals(globals);

            promiseFunc().then(() => {
                mocha.run();
                resolve(true);
            });
        });
    } // loadMocha


    function init(testScripts = [], type = 'bdd', globals = ['jQuery']) {
        if (testScripts.length === 0) {
            throw new Error('no tests loaded');
        }

        return loadCSS( 'https://cdn.rawgit.com/mochajs/mocha/2.2.5/mocha.css' )
            .then(() => loadScript('https://cdn.rawgit.com/Automattic/expect.js/0.3.1/index.js'))
            .then(() => loadScript('http://chaijs.com/chai.js'))
            .then(() => loadScript('https://cdn.rawgit.com/mochajs/mocha/2.2.5/mocha.js'))
            .then(() => {
                return loadMocha(type, globals, function() {
                    const first = testScripts.shift();

                    return testScripts.reduce((prom, currScript) => {
                        return prom.then(() => {
                            return loadScript(currScript);
                        });
                    }, loadScript(first));

                });
            });
    } // init

    return TestRunner = {
        init,
    };
})();
