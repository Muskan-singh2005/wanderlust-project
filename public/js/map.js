mapboxgl.accessToken = 'pk.eyJ1IjoibXVza2Fuc2FuZ2VyIiwiYSI6ImNtZGQ1YjRqcTAxMG0yanExOGl0Y3Awem8ifQ.UsHOjqTetvRJBFdtXmjqNw';

document.addEventListener("DOMContentLoaded", () => {
  if (typeof listingLocation !== "undefined" && listingLocation.trim() !== "") {
    const geocodeURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(listingLocation)}.json?access_token=${mapboxgl.accessToken}`;

    fetch(geocodeURL)
      .then(res => res.json())
      .then(data => {
        if (!data.features || data.features.length === 0) {
          console.error('No geocoding result for this location.');
          return;
        }

        const [lng, lat] = data.features[0].center;

        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [lng, lat],
          zoom: 10
        });

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h4>${listingLocation}</h4><p>Exact location provided after booking</p>`
        );

        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
      })
      .catch(err => {
        console.error('Mapbox geocoding error:', err);
      });
  } else {
    console.error('listingLocation is undefined or empty.');
  }
});
