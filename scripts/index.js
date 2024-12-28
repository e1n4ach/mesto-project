const placesList = document.querySelector(".places__list");
const cardTemplate = document.querySelector("#card-template").content;

function createCard(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  cardLikeButton.addEventListener("click", () => {
    cardLikeButton.classList.toggle("card__like-button_is-active");
  });

  cardDeleteButton.addEventListener("click", () => {
    const cardToDelete = cardDeleteButton.closest(".card");
    cardToDelete.remove();
  });

  cardImage.addEventListener("click", () => {
    const popupImage = imagePopup.querySelector(".popup__image");
    const popupCaption = imagePopup.querySelector(".popup__caption");

    popupImage.src = data.link;
    popupImage.alt = data.name;
    popupCaption.textContent = data.name;

    openModal(imagePopup);
  });

  return cardElement;
}

function renderInitialCards(cards) {
  cards.forEach((cardData) => {
    const card = createCard(cardData);
    placesList.append(card);
  });
}

renderInitialCards(initialCards);

const cardFormElement = document.querySelector('.popup__form[name="new-place"]');
const cardNameInput = cardFormElement.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardFormElement.querySelector(".popup__input_type_url");

function handleCardFormSubmit(evt) {
  evt.preventDefault();

  const newCardData = {
    name: cardNameInput.value, 
    link: cardLinkInput.value,
  };

  const newCard = createCard(newCardData);
  placesList.prepend(newCard);
  cardFormElement.reset();
  closeModal(cardPopup);
}

cardFormElement.addEventListener("submit", handleCardFormSubmit);

const profilePopup = document.querySelector(".popup_type_edit");
const cardPopup = document.querySelector(".popup_type_new-card");
const imagePopup = document.querySelector(".popup_type_image");
const popups = document.querySelectorAll(".popup");
const imagePopupCloseButton = imagePopup.querySelector(".popup__close");
const profileEditButton = document.querySelector(".profile__edit-button");
const cardAddButton = document.querySelector(".profile__add-button");
const closeButtons = document.querySelectorAll(".popup__close");

popups.forEach((popup) => popup.classList.add("popup_is-animated"));
imagePopupCloseButton.addEventListener("click", () => closeModal(imagePopup));
profileEditButton.addEventListener("click", () => openModal(profilePopup));
cardAddButton.addEventListener("click", () => openModal(cardPopup));

closeButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const popup = event.target.closest(".popup");
    closeModal(popup);
  });
});

popups.forEach((popup) => {
  popup.addEventListener("mousedown", (event) => {
    if (event.target === popup) {
      closeModal(popup);
    }
  });
});

function openModal(popup) {
  popup.classList.add("popup_is-opened");
  document.addEventListener("keydown", closeByEsc);
}

function closeModal(popup) {
  popup.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", closeByEsc);
}

const profileFormElement = document.querySelector('.popup__form[name="edit-profile"]');
const nameInput = profileFormElement.querySelector(".popup__input_type_name");
const jobInput = profileFormElement.querySelector(".popup__input_type_description");
const profileName = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileCloseButton = profilePopup.querySelector(".popup__close");

function handleOpenProfilePopup() {
  nameInput.value = profileName.textContent; 
  jobInput.value = profileDescription.textContent; 
  openModal(profilePopup); 
}

profileCloseButton.addEventListener("click", () => closeModal(profilePopup));

function handleProfileFormSubmit(evt) {
  evt.preventDefault(); 
  profileName.textContent = nameInput.value; 
  profileDescription.textContent = jobInput.value; 
  closeModal(profilePopup);
}

profileEditButton.addEventListener("click", handleOpenProfilePopup); 
profileFormElement.addEventListener("submit", handleProfileFormSubmit);

function closeByEsc(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) {
      closeModal(openedPopup);
    }
  }
}

const profileForm = document.querySelector('.popup__form[name="edit-profile"]');
const descriptionInput = profileForm.querySelector(".popup__input_type_description");
const submitButton = profileForm.querySelector(".popup__button");

function showError(input, errorMessage) {
  const errorElement = profileForm.querySelector(`#${input.name}-error`);
  errorElement.textContent = errorMessage;
  input.classList.add("popup__input_type_error");
}

function hideError(input) {
  const errorElement = profileForm.querySelector(`#${input.name}-error`);
  errorElement.textContent = "";
  input.classList.remove("popup__input_type_error");
}

function checkInputValidity(input) {
  if (!input.validity.valid) {
    showError(input, input.validationMessage);
  } else {
    hideError(input);
  }
}

function toggleButtonState() {
  if (profileForm.checkValidity()) {
    submitButton.disabled = false;
    submitButton.classList.remove("button_disabled");
  } else {
    submitButton.disabled = true;
    submitButton.classList.add("button_disabled");
  }
}

[nameInput, descriptionInput].forEach((input) => {
  input.addEventListener("input", () => {
    checkInputValidity(input);
    toggleButtonState();
  });
});

const newPlaceForm = document.querySelector('.popup__form[name="new-place"]');
const placeNameInput = newPlaceForm.querySelector(".popup__input_type_card-name");
const placeLinkInput = newPlaceForm.querySelector(".popup__input_type_url");
const newPlaceSubmitButton = newPlaceForm.querySelector(".popup__button");

function showError_newPlaceForm(input) {
  const errorElement = newPlaceForm.querySelector(`#${input.name}-error`);
  errorElement.textContent = input.validationMessage;
  input.classList.add("popup__input_type_error");
}

function hideError_newPlaceForm(input) {
  const errorElement = newPlaceForm.querySelector(`#${input.name}-error`);
  errorElement.textContent = "";
  input.classList.remove("popup__input_type_error");
}

function checkInputValidity_newPlaceForm(input) {
  if (!input.validity.valid) {
    showError_newPlaceForm(input);
  } else {
    hideError_newPlaceForm(input);
  }
}

function toggleButtonState_newPlaceForm() {
  if (newPlaceForm.checkValidity()) {
    newPlaceSubmitButton.disabled = false;
    newPlaceSubmitButton.classList.remove("button_disabled");
  } else {
    newPlaceSubmitButton.disabled = true;
    newPlaceSubmitButton.classList.add("button_disabled");
  }
}

[placeNameInput, placeLinkInput].forEach((input) => {
  input.addEventListener("input", () => {
    checkInputValidity_newPlaceForm(input);
    toggleButtonState_newPlaceForm();
  });
});

toggleButtonState_newPlaceForm();
