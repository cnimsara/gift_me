function setGiftboxAction(actionType) {
  const hiddenField = document.getElementById('giftboxAction');
  if (hiddenField) {
    hiddenField.value = actionType;
  }
}
