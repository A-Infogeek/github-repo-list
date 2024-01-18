const apiUrl = 'https://api.github.com';

function renderRepoBox(repo) {
    var desc= repo.description;
    if(desc==null)
        desc='';
    const languages = repo.languages ? Object.keys(repo.languages) : [];
    const languagesTags = languages.map(language => `<span class="badge badge-primary">${language}</span>`).join(' ');
    return `
      <div class="repo-box">
        <h3 class="text-primary">${repo.name}</h3>
        <p>${desc}</p>
        <p>${languagesTags || 'Not specified'}</p>
      </div>
    `;
  }

  function renderPagination(pageCount, username, perPage, currentPage) {
    $('#pagination').empty();
  
    if (currentPage > 1) {
      $('#pagination').append(`<button class="btn btn-primary" onclick="fetchUserAndRepos('${username}', ${currentPage - 1}, ${perPage})">Older</button>`);
    }
  
    for (let i = 1; i <= pageCount; i++) {
      $('#pagination').append(`<button class="btn btn-primary ${currentPage === i ? 'active' : ''}" onclick="fetchUserAndRepos('${username}', ${i}, ${perPage})">${i}</button>`);
    }
  
    if (currentPage < pageCount) {
      $('#pagination').append(`<button class="btn btn-primary" onclick="fetchUserAndRepos('${username}', ${currentPage + 1}, ${perPage})">Newer</button>`);
    }
  }

function fetchUserAndRepos(username, page = 1, perPage = 10) {
    $('#loader').show();

    // Fetch user data
    $.get(`${apiUrl}/users/${username}`, (userData) => {
        // Display user info
        $('#user-info').html(`
            <div class="row">
                <div class="col-md-3">
                <img src="${userData.avatar_url}" alt="Profile Image" style="max-width: 100px;" class="rounded-circle">
                </div>
                <div class="col-md-9">
                <h2>${userData.name}</h2>
                <p>${userData.bio}</p>
                <p><i class="fa-solid fa-location-dot"></i> ${userData.location}</p>
                </div>
                <p><i class="fa-solid fa-link"></i> <a href="${userData.html_url}" target="_blank" class="text-dark">${userData.html_url}</a></p>
            </div>
        `);



        $.get(`${apiUrl}/users/${username}/repos?page=${page}&per_page=${perPage}`, (repos) => {
        $('#repositories').empty();

        // Fetch languages for each repository
        const fetchLanguagesPromises = repos.map(repo => {
            return $.get(repo.languages_url);
        });

        // Wait for all language requests to complete
        $.when(...fetchLanguagesPromises).then((...languages) => {
            // Assign languages to their respective repositories
            repos.forEach((repo, index) => {
            repo.languages = languages[index][0] || {};
            });

            // Display repositories in two columns
            for (let i = 0; i < repos.length; i += 2) {
            const repo1 = repos[i];
            const repo2 = repos[i + 1];

            // Create a row for each pair of repositories
            $('#repositories').append(`
                <div class="row">
                <div class="col-md-6">
                    ${repo1 ? renderRepoBox(repo1) : ''}
                </div>
                <div class="col-md-6">
                    ${repo2 ? renderRepoBox(repo2) : ''}
                </div>
                </div>
            `);
            }

            // Pagination and loader
            const pageCount = Math.ceil(repos.length / 2);
            renderPagination(pageCount, username, perPage, page);
            $('#loader').hide();
        });
        });
    });
}

// Initial load
const defaultUsername = 'johnpapa';
fetchUserAndRepos(defaultUsername);