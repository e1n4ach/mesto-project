import './pages/index.css'; // Import styles

//Fetch info of user and render card
function getUserInfo() {
  return fetch('https://nomoreparties.co/v1/apf-cohort-202/users/me', {
    headers: {
      authorization: 'b848beae-2b0f-416b-90d1-dba6fc10dbef'
    }
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Ошибка: ${res.status}`);
    })
    .catch((err) => {
      console.error(err);
    });
}

function getInitialCards() {
  return fetch('https://nomoreparties.co/v1/apf-cohort-202/cards', {
    headers: {
      authorization: 'b848beae-2b0f-416b-90d1-dba6fc10dbef'
    }
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Ошибка: ${res.status}`);
    });
}

//rendering cards
const placesList = document.querySelector(".places__list");
function renderInitialCards(cards) {
  cards.forEach((cardData) => {
    const card = createCard(cardData);
    placesList.append(card);
  });
}

let currentUserId = null;
document.addEventListener('DOMContentLoaded', () => {
  Promise.all([getUserInfo(), getInitialCards()])
    .then(([userData, cardsData]) => {
      const profileName = document.querySelector(".profile__title");
      const profileDescription = document.querySelector(".profile__description");
      const profileImage = document.querySelector(".profile__image");
      currentUserId = userData._id;
      
      profileName.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileImage.src = userData.avatar;
      profileImage.alt = `Аватар ${userData.name}`;

      renderInitialCards(cardsData);
    })
    .catch((err) => {
      console.error('Ошибка при загрузке данных:', err);
    });
});

//function of all cards mechaniks
const cardTemplate = document.querySelector("#card-template").content;
function createCard(data) {
  const cardFragment = cardTemplate.cloneNode(true);
  const cardElement = cardFragment.firstElementChild; 
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");
  const cardLikeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  cardLikeCount.textContent = data.likes.length;

  if (data.likes.some((user) => user._id === currentUserId)) {
    cardLikeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== currentUserId) {
    cardDeleteButton.remove();
  }

  cardLikeButton.addEventListener("click", () => {
    const isLiked = cardLikeButton.classList.contains("card__like-button_is-active");

    fetch(`https://nomoreparties.co/v1/apf-cohort-202/cards/likes/${data._id}`, {
      method: isLiked ? 'DELETE' : 'PUT',
      headers: {
        authorization: 'b848beae-2b0f-416b-90d1-dba6fc10dbef',
      },
    })
    .then((res) => {
      if (!res.ok) {
        return Promise.reject(`Ошибка: ${res.status}`);
      }
      return res.json();
    })
    .then((updatedCard) => {
      // Обновляем количество лайков и состояние кнопки
      cardLikeCount.textContent = updatedCard.likes.length;
      if (isLiked) {
        cardLikeButton.classList.remove("card__like-button_is-active");
      } else {
        cardLikeButton.classList.add("card__like-button_is-active");
      }
    })
    .catch((err) => {
      console.error("Ошибка обновления лайка:", err);
    });
  });

  cardDeleteButton?.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
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

//function of deleting card
function handleDeleteCard(cardElement, cardId) {
  if (!(cardElement instanceof HTMLElement)) {
    console.error('Invalid card element');
    return;
  }

  if (!confirm('Вы уверены, что хотите удалить эту карточку?')) return;

  fetch(`https://nomoreparties.co/v1/apf-cohort-202/cards/${cardId}`, {
    method: 'DELETE',
    headers: {
      authorization: 'b848beae-2b0f-416b-90d1-dba6fc10dbef'
    }
  })
  .then(res => {
    if (!res.ok) return Promise.reject(`Ошибка: ${res.status}`);
    cardElement.remove();
  })
  .catch(err => {
    console.error('Ошибка удаления карточки:', err);
    alert('Не удалось удалить карточку');
  });
}

//Button submit of new place
const cardFormElement = document.querySelector('.popup__form[name="new-place"]');
const cardNameInput = cardFormElement.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardFormElement.querySelector(".popup__input_type_url");
function handleCardFormSubmit(evt) {
  evt.preventDefault();
  
  const submitButton = cardFormElement.querySelector('.popup__button');
  const initialButtonText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  fetch('https://nomoreparties.co/v1/apf-cohort-202/cards', {
    method: 'POST',
    headers: {
      authorization: 'b848beae-2b0f-416b-90d1-dba6fc10dbef',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: cardNameInput.value,
      link: cardLinkInput.value
    })
  })
  .then(res => {
    if (!res.ok) return Promise.reject(res.status);
    return res.json();
  })
  .then(cardData => {
    const newCard = createCard({...cardData, owner: {_id: currentUserId}});
    placesList.prepend(newCard);
    cardFormElement.reset();
    closeModal(cardPopup); 
  })
  .catch(err => {
    console.error('Ошибка создания карточки:', err);
  })
  .finally(() => {
    submitButton.textContent = initialButtonText;
    submitButton.disabled = false;
  });
}

cardFormElement.addEventListener("submit", handleCardFormSubmit);

// Close modal popups for click in to free space, escape and close button
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

function closeByEsc(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) {
      closeModal(openedPopup);
    }
  }
}

//functions of profile name and about popup: open and submit
const profileFormElement = document.querySelector('.popup__form[name="edit-profile"]');
const nameInput = profileFormElement.querySelector(".popup__input_type_name");
const jobInput = profileFormElement.querySelector(".popup__input_type_description");
const profileName = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileCloseButton = profilePopup.querySelector(".popup__close");

function handleOpenProfilePopup() {
  nameInput.value = profileName.textContent; 
  jobInput.value = profileDescription.textContent; 
  checkInputValidity(nameInput);
  checkInputValidity(jobInput);
  toggleButtonState();
  openModal(profilePopup); 
}

profileCloseButton.addEventListener("click", () => closeModal(profilePopup));

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  
  const submitButton = profileFormElement.querySelector('.popup__button');
  const initialButtonText = submitButton.textContent;

  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  fetch('https://nomoreparties.co/v1/apf-cohort-202/users/me', {
    method: 'PATCH',
    headers: {
      authorization: 'b848beae-2b0f-416b-90d1-dba6fc10dbef',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: nameInput.value,
      about: jobInput.value
    })
  })
  .then(res => {
    if (!res.ok) return Promise.reject(res.status);
    return res.json();
  })
  .then(userData => {
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    closeModal(profilePopup); // Закрываем только при успехе
  })
  .catch(err => {
    console.error('Ошибка обновления профиля:', err);
  })
  .finally(() => {
    // Всегда восстанавливаем кнопку
    submitButton.textContent = initialButtonText;
    submitButton.disabled = false;
  });
}

profileEditButton.addEventListener("click", handleOpenProfilePopup); 
profileFormElement.addEventListener("submit", handleProfileFormSubmit);

// check validaty of name and description of profile
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

// check validaty of new-place form
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


// function of edit profile icon and check validaty 
const avatarContainer = document.querySelector('.profile__image-container');
const avatarPopup = document.querySelector(".popup_type_avatar");

avatarContainer.addEventListener('click', () => {
  openModal(avatarPopup);
  avatarForm.reset();
  toggleAvatarButtonState();
});

// validaty avatar form
const avatarForm = document.querySelector('.popup__form[name="avatar-form"]');
const avatarInput = avatarForm.querySelector('input[name="avatar"]');
const avatarSubmitButton = avatarForm.querySelector('.popup__button');

function checkAvatarInputValidity() {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  const isValid = urlRegex.test(avatarInput.value);
  
  if (!isValid && avatarInput.value !== '') {
    avatarInput.classList.add('popup__input_type_error');
    return false;
  }
  avatarInput.classList.remove('popup__input_type_error');
  return isValid;
}

function toggleAvatarButtonState() {
  avatarSubmitButton.disabled = !checkAvatarInputValidity();
  avatarSubmitButton.classList.toggle('button_disabled', !checkAvatarInputValidity());
}

avatarInput.addEventListener('input', () => {
  toggleAvatarButtonState();
});

avatarForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  
  const submitButton = avatarForm.querySelector('.popup__button');
  const initialText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  fetch('https://nomoreparties.co/v1/apf-cohort-202/users/me/avatar', {
    method: 'PATCH',
    headers: {
      authorization: 'b848beae-2b0f-416b-90d1-dba6fc10dbef',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ avatar: avatarInput.value })
  })
  .then(res => {
    if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
    return res.json();
  })
  .then(userData => {
    document.querySelector(".profile__image").src = userData.avatar;
    closeModal(avatarPopup); // Закрываем только при успехе
  })
  .catch(err => {
    console.error('Ошибка обновления аватара:', err);
    // Попап остается открытым при ошибке
  })
  .finally(() => {
    submitButton.textContent = initialText;
    submitButton.disabled = false;
  });
});
