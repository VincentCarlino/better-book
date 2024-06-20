import cards from '../yugioh.json';
import memento from './memento.ydk';

fetch(memento)
  .then((res) => res.text())
  .then((text) => {
    const ygo = new Yugioh();
    return ygo.importYDKE(text);
   })
  .catch((e) => console.error(e));
/**
 * An interface for getting cards from the YGOPro API 
 * (The whole set of cards from YGOPro has been extracted and stored locally)
 */
class Yugioh {

    constructor() {
        this.cards = cards.data;
        this.aceMonsterIds = [46986414, 89631139, 84013237, 5405694, 74677422]
    }

    getAltArtWithIndex() {

    }

    getRandomImage() {
        return this.cards[Math.floor(Math.random()*this.cards.length)].card_images[0].image_url
    }

    getRandomMonster() {

    }

    getRandomSpell() {

    }

    getRandomTrap() {

    }

    getRandomAceMonsterImage() {
        const aceId = this.aceMonsterIds[Math.floor(Math.random()*this.aceMonsterIds.length)]
        return this.getImage(aceId)

    }

    getImageSmall(idOrCard) {
        try {
            if (idOrCard instanceof Object) {
                return idOrCard.card_images[0].image_url_small;
            } else {
                return this.cards.find((c) => c.id === idOrCard).card_images[0].image_url_small
            }
        } catch (e) {
            console.error(`Failed to find card image: ${e}`)
        }
    }

    getImage(id) {
        return this.cards.find((c) => c.id === id).card_images[0].image_url;
    }

    getCardByID(id) {
        return this.cards.find((c) => c.id === id);
    }

    getCardByName(name) {
        return this.cards.find((c) => c.name === name);
    }

    /**
     * Evaluates a ydke string and returns a jsonified list
     * @param {str} ydke 
     */
    importYDKE(ydke) {
        // Just Spright Blue: ydke://DeWJBA==!!!
        // Just Spright Red: ydke://zXuGBA==!!!
        // Two Blue: ydke://DeWJBA3liQQ=!!!
        // Three Blue: ydke://DeWJBA3liQQN5YkE!!!
        // Three Blue + One Red: ydke://DeWJBA3liQQN5YkEzXuGBA==!!!
        // Two Blue + One Red: ydke://DeWJBA3liQTNe4YE!!!

        // Original Dark Magician: ydke://rvTMAg==!!!
        // Arcana DM: ydke://nIU0Ag==!!!
        // Arcana + Original: ydke://nIU0Aq70zAI=!!!
        // Original + Arcana: ydke://rvTMApyFNAI=!!!
    }

    /**
     * Imports the contents of a ydk file and converts it to json
     * TODO: give every card in a deck a uuid
     * @param {*} ydk a string containing names of cards and their respective counts
     */
    importYDKtoJSON(ydk) {
        const lines = ydk.split('\n');

        const decks = {
            mainDeck: [],
            extraDeck: []
        }

        let activeDeck = 'mainDeck';
        lines.forEach((line) => {
            if(line === "Main Deck:") {

            }
            else if (line === "Extra Deck:") {
                activeDeck = 'extraDeck';
            }
            else if (line.length > 0) {
                let numCard = Number(line.slice(-1));
                let cardName = line.slice(0, -3);

                for (let i = 0; i < numCard; i++) {
                    decks[activeDeck].push(this.getCardByName(cardName));
                }
            }
        })

        return decks

    }
}

export const yugioh = new Yugioh();