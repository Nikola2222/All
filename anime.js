document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://shikimori.one/api/animes?order=ranked';
    const animeUrlPrefix = 'https://shikimori.one/api/animes/';
    const posterPrefix = 'https://shikimori.one';
    const perPage = 40;
    let currentPage = getPageFromUrl();
    let searchTerm = getSearchTermFromUrl();

    function getPageFromUrl() {
        return parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
    }

    function getSearchTermFromUrl() {
        return new URLSearchParams(window.location.search).get('search') || '';
    }

    function fetchAnime(page) {
        const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
        const langParam = searchTerm === 'russian' ? '&lang=ru' : '';
        const url = `${apiUrl}&page=${page}&limit=${perPage}${searchParam}${langParam}&order=ranked`;
        return fetch(url)
            .then(response => response.json())
            .catch(error => console.error('Error fetching anime:', error));
    }

    function displayAnime(animeList) {
        const animeListElement = document.getElementById('anime-list');
        animeListElement.innerHTML = '';
        
        animeList.forEach(anime => {
            // Проверяем наличие эпизодов и ссылки на плеер Kodik
            if ((anime.episodes && anime.episodes > 0) || (anime.episodes_aired && anime.episodes_aired > 0)) {
                const kodikUrl = `https://kodikapi.com/search?token=50e058ac7c2b71a73ee87e4fea333544&types=anime-serial,anime&shikimori_id=${anime.id}`;

                fetch(kodikUrl)
                    .then(response => response.json())
                    .then(kodikData => {
                        if (kodikData.results.length > 0 && kodikData.results[0].link) {
                            const animeItem = document.createElement('span');
                            animeItem.classList.add('anime-item');
                            animeItem.dataset.id = anime.id;

                           const playItDiv = document.createElement('div');
playItDiv.classList.add('anime');

const poster = document.createElement('img');
poster.classList.add('anime-poster');
poster.src = posterPrefix + anime.image.original;
poster.alt = anime.russian || anime.name;
playItDiv.appendChild(poster);

const kodikButton = document.createElement('span');
kodikButton.classList.add('play-it');
kodikButton.addEventListener('click', () => showKodikPlayer(anime.id));
playItDiv.appendChild(kodikButton);

animeItem.appendChild(playItDiv);


                            const title = document.createElement('span');
                            title.classList.add('anime-title');
                            title.innerText = anime.russian || anime.name;
                            animeItem.appendChild(title);                           

                            animeListElement.appendChild(animeItem);

                            animeItem.addEventListener('mouseenter', () => showAnimePopup(anime, animeItem));
                            animeItem.addEventListener('mouseleave', () => hideAnimePopup(animeItem));
                        }
                    })
                    .catch(error => console.error('Ошибка при проверке доступности плеера на Kodik:', error));
            }
        });

        const url = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : `?page=${currentPage}`;
        history.pushState({ page: currentPage, search: searchTerm }, '', url);
    }

    function updatePagination(hasSearchTerm, totalPages) {
        const paginationElement = document.getElementById('pagination');
        paginationElement.innerHTML = '';

        const prevButton = document.createElement('button');
        prevButton.classList.add('prev');
        if (currentPage > 1) {
            prevButton.addEventListener('click', () => {
                currentPage--;
                fetchAnime(currentPage)
                    .then(data => {
                        displayAnime(data);
                        updatePagination(searchTerm !== '', totalPages);
                        updateURL(currentPage, searchTerm);
                    });
            });
            paginationElement.appendChild(prevButton);
        }

        const nextButton = document.createElement('button');
        nextButton.classList.add('next');
        nextButton.addEventListener('click', () => {
            currentPage++;
            fetchAnime(currentPage)
                .then(data => {
                    displayAnime(data);
                    updatePagination(searchTerm !== '', totalPages);
                    updateURL(currentPage, searchTerm);
                });
        });
        paginationElement.appendChild(nextButton);

        paginationElement.style.display = hasSearchTerm ? 'none' : 'flex';
    }

    function updateURL(page, searchTerm) {
        const url = searchTerm ? `?search=${encodeURIComponent(searchTerm)}&page=${page}` : `?page=${page}`;
        history.pushState({ page, search: searchTerm }, '', url);
    }

    fetchAnime(currentPage)
        .then(data => {
            if (data && data.meta && typeof data.meta.total_count !== 'undefined') {
                const totalPages = Math.ceil(data.meta.total_count / perPage);
                displayAnime(data);
                updatePagination(searchTerm !== '', totalPages);
            } else {
                console.error('Ошибка при получении данных: некорректный формат ответа.');
            }
        })
        .catch(error => console.error('Ошибка при получении данных:', error));

    function searchAnime(searchTerm) {
        fetchAnime(1)
            .then(data => displayAnime(data))
            .then(() => updatePagination(true));
    }

    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', function() {
        searchTerm = this.value.trim();
        if (searchTerm === '' || searchTerm === 'name' || searchTerm === 'russian') {
            searchTerm = '';
            fetchAnime(currentPage)
                .then(data => displayAnime(data))
                .then(() => updatePagination(false));
        } else {
            searchAnime(searchTerm);
        }
    });

    fetchAnime(currentPage)
        .then(data => displayAnime(data))
        .then(() => updatePagination(searchTerm !== ''));
});

function showAnimePopup(anime, animeItem) {
    const animePopup = document.createElement('div');
    animePopup.classList.add('anime-popup');
    animeItem.appendChild(animePopup);

    const animeItemRect = animeItem.getBoundingClientRect();
    const popupWidth = animePopup.offsetWidth;
    const animeItemRightSpace = window.innerWidth - animeItemRect.right;

    animePopup.style.left = animeItemRightSpace >= popupWidth + 88 && animeItemRightSpace - popupWidth >= 0 ? '88px' : 'auto';
    animePopup.style.right = animeItemRightSpace >= popupWidth + 88 && animeItemRightSpace - popupWidth >= 0 ? 'auto' : '88px';
    animePopup.style.position = 'absolute';
    animePopup.style.background = 'white';
    animePopup.style.padding = '10px';
    animePopup.style.zIndex = '1';
    animePopup.style.width = '150px';
    animePopup.style.display = 'block';
    animePopup.style.borderRadius = '3px';
    animePopup.style.boxShadow = '0 0 0 2px #d9dcef';

    

    const animeApiUrl = `https://shikimori.one/api/animes/${anime.id}`;
    fetch(animeApiUrl)
        .then(response => response.json())
        .then(data => {
            let status;
            switch (data.status) {
                case 'anons':
                    status = 'Анонс';
                    break;
                case 'ongoing':
                    status = 'Онгоинг';
                    break;
                case 'released':
                    status = 'Вышло';
                    break;
                default:
                    status = data.status;
                    break;
            }

            let nextEpisode = '';
            if (data.status === 'ongoing' && data.next_episode_at) {
                nextEpisode = formatDate(data.next_episode_at);
            }

            const genres = data.genres.map(genre => genre.russian || genre.name).join(', ');
            const episodesInfo = data.episodes_aired !== undefined && data.episodes_aired !== 0 ? data.episodes_aired : data.episodes !== undefined && data.episodes !== 0 ? data.episodes : 0;

            animePopup.innerHTML = `
                <span class="name">${data.russian || data.name}</span> <br>
                <span>Рейтинг: ${data.score}</span><br>
                <span>Эпизоды: ${episodesInfo}</span><br>
                ${nextEpisode ? `<span>Следующий эпизод: ${nextEpisode}</span><br>` : ''}
                <span>Статус: ${status}</span><br>
            `;
        });
}

function hideAnimePopup(animeItem) {
    const animePopup = animeItem.querySelector('.anime-popup');
    animePopup.remove();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

function showKodikPlayer(shikimoriId) {
    const kodikUrl = `https://kodikapi.com/search?token=50e058ac7c2b71a73ee87e4fea333544&types=anime-serial,anime&shikimori_id=${shikimoriId}`;
    fetch(kodikUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 0) {
                throw new Error('Аниме не найдено в базе данных Kodik.');
            }

            const kodikAnime = data.results[0];
            if (!kodikAnime.link) {
                throw new Error('Для данного аниме нет доступного плеера на Kodik.');
            }

            const kodikLink = `https:${kodikAnime.link}`;
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="closeModal()">&times;</span>
                    <iframe src="${kodikLink}" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'flex';
        })
        .catch(error => alert(error.message));
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.parentNode.removeChild(modal);
    }
}

