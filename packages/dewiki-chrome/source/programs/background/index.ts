function backgroundMain() {
    const dewiki = 'https://dewiki.plurid.com';

    const wikipediaRE = /wikipedia\.org/;
    const languageRE = /https?:\/\/(\w{2})\.wikipedia\.org/;
    const pageRE = /wikipedia\.org\/wiki\/(.+)/;

    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            const {
                url,
            } = details;

            if (!wikipediaRE.test(url)) {
                return;
            }

            const languageMatch = url.match(languageRE);
            const pageMatch = url.match(pageRE);

            if (!languageMatch && !pageMatch) {
                return;
            }

            const language = languageMatch[1];
            const page = pageMatch[1];
            const dewikiPage = `${dewiki}/${language}/${page}`;
            return {
                redirectUrl: dewikiPage,
            };
        },
        {
            urls: ['<all_urls>'],
            types: ["main_frame"],
        },
        [
            "blocking",
        ],
    );
}

backgroundMain();
