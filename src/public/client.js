let store = Immutable.Map({
  currentRover: '',
  manifest: '',
  latestImg: '',
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
  store = store.merge(Immutable.Map(newState));
  render(root, store)
    .catch(error => {
      console.log(`Has error occurred - ${error}`)
    })
}

const render = async (root, state) => {
  root.innerHTML = App(state, renderRover, renderRoverData)
}

// -------------------------Create content------------------------- //

// The first Higher-Order Functions
const App = (state, renderRover, renderRoverData) => {
  return (`
    <section class="wrapper">
      ${renderRover(state)}
      ${renderRoverData(state, getLatestPhotos)}
    </section>
  `);
}

// -------------------------Component------------------------- //

// Render list rover and add buttons to select Mars rovers.
const renderRover = (store) => {
  return (`
    <nav class="navigation">
      <h2 class="title">Please select Mars rover</h2>
      <ul class="navigation__item">
        ${store.get('rovers')?.map((e) =>
          `<li class="navigation__item--left">
            <button class="navigation__button" type='button' value='${e}' onclick='loadRoverData(this.value)'>${e}</button>
          </li>`
        ).join("")}
      </ul>
    </nav>
  `)
}

// The second Higher-Order Functions.
const renderRoverData = (store, getLatestPhotos) => {
  if (store.get("manifest")) {
    const roverName = store.get("currentRover");
    const { manifest: { photo_manifest: { launch_date, landing_date, status, max_date } } } = store.get("manifest");
    return `
      <div class="container-fluid m-0 p-0">
        <div class="d-flex justify-content-center flex-column align-items-center">
          <p class="text-loading">Rover Name: ${roverName}</p>
          <p class="text-loading">Launch Date: ${launch_date}</p>
          <p class="text-loading">Landing Date: ${landing_date}</p>
          <p class="text-loading">Status: ${status}</p>
          <p class="text-loading">Date The Most Recent Photos Were Taken: ${max_date}</p>
        </div>
        <div class="row justify-content-center">
          ${getLatestPhotos(store)}
        </div>
      </div>
    `
  }
  return ``
}

// add latest photos to the DOM
const getLatestPhotos = (store) => {
  
  if (store.get("latestImg") === '') {
    return `
      <div class="container-fluid m-0 p-0">
        <h5 class="text-loading">Loading rover photos...</h5>
      </div>
    `
  } else {
    const { latestImg: { photos } } = store.get("latestImg");
    const images = photos.map(({ img_src }) => {
      return `
        <div class="d-flex justify-content-center">
          <img src="${img_src}" class="d-block m-3 rounded-lg w-100" alt="...">
        </div>
      `
    }).join("");
    const imageContainer = `${images}`;
    return imageContainer;
  }
}

// -------------------------API calls------------------------- //

const loadRoverData = (button) => {
  // get the selected rover name from the button clicked by user
  let roverName = button.toLowerCase();
  let currentRover = roverName;
  updateStore({ currentRover })

  // The first API call to get the rover data such as launch date, landing date, status, and data where the last photos were taken
  fetch(`http://localhost:3000/manifest/${roverName}`)
    .then(res => res.json())
    .then(manifest => {
      updateStore({ manifest });

      // The second API call to get rover photos URL with max_date (taken from previous API call)
      const { manifest: { photo_manifest: { max_date } } } = manifest;
      fetch(`http://localhost:3000/latestImg/${roverName}/${max_date}`)
        .then(res => res.json())
        .then(latestImg => updateStore({ latestImg }))
        .catch(error => {
          console.log(`Has error occurred - ${error}`)
        })
    })
    .catch(error => {
      console.log(`Has error occurred - ${error}`)
    });
}

// -------------------------Load event------------------------- //

// Listening for load event because the page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store)
    .catch(error => {
      console.log(`Has error occurred - ${error}`)
    })
})
