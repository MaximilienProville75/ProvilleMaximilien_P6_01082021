import Photograph from "./Class/Photograph.js";
import MediaFactory from "./Class/MediaFactory.js";

const params = new URL(window.location).searchParams;
const pageId = parseInt(params.get("id"), 10);
const mediaGallery = document.getElementById("mediaGallery");

const orderByClick = document.getElementById("orderByClick");
const orderOptions = document.querySelector(".orderOptions");
const filterContent = document.getElementById("filterContent");
const orderbotArrow = document.getElementById("orderbotArrow");
const orderSelected = document.getElementById("orderSelected");
const filterOptions = document.querySelectorAll(".option");

const photographerTotalLikes = document.getElementById("totalLikes");
const photographerPrice = document.getElementById("price");
const formheader = document.getElementById("formHeader");

let totalLikes = 0;
let mediaList = [];

function enterPressDown() {
  const containerMedia = Array.from(
    document.querySelectorAll(".imageContainer img, .videoContainer source, i")
  );
  containerMedia.forEach((media) => {
    media.addEventListener("keypress", function onEvent(event) {
      if (event.key === "Enter") {
        media.click();
      }
    });
  });
}

function totalLikesAndPrice(element) {
  photographerPrice.innerText = `${element.price} € / jour`;
  photographerTotalLikes.innerHTML = `${totalLikes} <i class="fas fa-heart"></i>`;
}

function animateAndIncrementLikes() {
  const heartIcons = document.querySelectorAll(".heart");
  heartIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      icon.classList.toggle("full");

      totalLikes = icon.classList.contains("full")
        ? (totalLikes += 0.5)
        : (totalLikes -= 0);
      photographerTotalLikes.innerHTML = `${totalLikes} <i class='fas fa-heart'></i>`;
    });
  });
}

function openAndCloseDropdown() {
  if (!orderOptions.classList.contains("open")) {
    orderOptions.classList.toggle("open");
    orderbotArrow.animate([{ transform: "rotate(180deg)" }], {
      duration: 300,
      fill: "forwards",
    });
  } else {
    orderbotArrow.animate([{ transform: "rotate(0deg)" }], {
      duration: 300,
      fill: "forwards",
    });

    const close = () => {
      orderOptions.classList.toggle("open");
      orderByClick.setAttribute("aria-expanded", "false");
    };
    orderOptions.animate(
      [{ opacity: "0", transform: "translateY(-25px)" }],
      360,
      "ease-in-out"
    );
    setTimeout(close, 300);
  }
}
orderByClick.addEventListener("click", (e) => {
  e.preventDefault();
  openAndCloseDropdown();
});
window.addEventListener("click", (e) => {
  if (
    orderOptions.classList.contains("open") &&
    !filterContent.contains(e.target)
  ) {
    openAndCloseDropdown();
  }
});

filterOptions.forEach((option) => {
  if (option.getAttribute("aria-selected") === "true") {
    orderSelected.innerText = option.innerText;
    option.classList.add("hidden");
  }

  option.addEventListener("click", (e) => {
    e.preventDefault();
    const filterLastSelected = document.querySelector(
      ".orderOptions > .hidden"
    );
    filterLastSelected.setAttribute("aria-selected", "false");
    filterLastSelected.classList.remove("hidden");
    option.classList.add("hidden");
    option.setAttribute("aria-selected", "true");
    orderSelected.innerText = option.innerText;
  });
});

document.body.addEventListener("mousedown", () => {
  document.body.classList.add("using-mouse");
});
document.body.addEventListener("keydown", (event) => {
  if (event.keyCode === 9) {
    document.body.classList.remove("using-mouse");
  }
});

function fetchData(url) {
  return fetch(url)
    .then((res) => res.json())
    .then(function (response) {
      const { medias, photographers } = response;
      let newPhotographer;

      photographers.forEach((photographer) => {
        const { name, id, city, country, tags, tagline, price, portrait } =
          photographer;

        if (pageId === id) {
          newPhotographer = new Photograph(
            name,
            id,
            city,
            country,
            tags,
            tagline,
            price,
            portrait
          );
          newPhotographer.renderArtistBanner();
          formheader.innerText = `Contactez-moi 
          ${newPhotographer.name}`;
        }
      });

      medias.forEach((media) => {
        const firstName = newPhotographer.name.split(" ")[0];
        const id = newPhotographer.id;
        const { photographerId } = media;
        let objectMedia = null;

        if (photographerId === id) {
          objectMedia = MediaFactory.createMedia(media, firstName);
          totalLikes += objectMedia.likes;
          objectMedia.display(firstName);
          mediaList.push(objectMedia);
        }
      });

      filterOptions.forEach((option) => {
        const firstName = newPhotographer.name.split(" ")[0];
        option.addEventListener("click", () => {
          if (option.dataset.value === "titre") {
            mediaList.sort((a, b) =>
              a.title.toUpperCase().localeCompare(b.title.toUpperCase())
            );
            setTimeout(500, openAndCloseDropdown());
          } else if (option.dataset.value === "date") {
            mediaList.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTimeout(500, openAndCloseDropdown());
          } else if (option.dataset.value === "popularite") {
            mediaList.sort((a, b) => b.likes - a.likes);
            setTimeout(500, openAndCloseDropdown());
          }
          mediaGallery.innerHTML = " ";
          totalLikes = 0;
          mediaList.forEach((media) => {
            totalLikes += media.likes;
            media.display(firstName);
            totalLikesAndPrice(newPhotographer);
          });
          animateAndIncrementLikes();
        });
      });
      animateAndIncrementLikes();
      enterPressDown();
      totalLikesAndPrice(newPhotographer);
      return response;
    });
}
fetchData("FishEyeData.json");
