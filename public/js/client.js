/* global TrelloPowerUp */
function fromMilisecondsToHoursAndMinutes(time) {
  const seconds = parseInt(time / 1000);
  const minutes = parseInt(seconds / 60);
  const hours = parseInt(minutes / 60);
  const days = parseInt(hours / 24);

  if (hours >= 24) {
    return `${days}d`;
  }

  if (minutes >= 60) {
    return `${hours}h`;
  }

  if (seconds < 60) {
    return `few seconds`;
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }
}

var Promise = TrelloPowerUp.Promise;

import auth from './auth'
auth()

TrelloPowerUp.initialize({
  "card-badges": function(
    t,
    options /* Returns some data from current card like id, etc*/
  ) {
    // console.log(t)
    return t
      .card("dateLastActivity")
      .get("dateLastActivity")
      .then(lastActivity => {
        return lastActivity;
      })
      .then(lastActivity => {
        const getId = t.card("id").get("id");

        return Promise.all([getId, lastActivity]);
      })
      .then(([cardId, lastActivity]) => {
        const getActions = window.Trello.get(`/cards/${cardId}/actions`);
        return Promise.all([getActions, lastActivity]);
      })
      .then(([actions, lastActivity]) => {
        // console.log(actions.find((action) => action.type === 'updateCard' || action.type === 'createCard'))
        const createOrUpdateCard = actions.find(action => {
          return action.type === "updateCard" || action.type === "createCard";
        });

        if (createOrUpdateCard) {
          // console.log(createOrUpdateCard)
          return createOrUpdateCard.date;
        } else {
          return lastActivity;
        }
      })
      .then(lastMoveListDate => {
        // console.log(lastMoveListDate)
        return fromMilisecondsToHoursAndMinutes(
          Math.abs(new Date(lastMoveListDate) - new Date())
        );
      })
      .then(hours => {
        return [
          {
            dynamic: function() {
              return {
                // icon: BLACK_ROCKET_ICON,
                text: `${hours}`,
                refresh: 30
              }
            }
          }
        ];
      })
      .catch(err => {
        console.log(err);
      });
  },
});
