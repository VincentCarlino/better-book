import cards from '../yugioh.json';

/**
 * An interface for getting cards from the YGOPro API 
 * (The whole set of cards from YGOPro has been extracted and stored locally)
 */
class Yugioh {

    constructor() {
        this.cards = cards.data;
    }

    getRandomImage() {
        return this.cards[Math.floor(Math.random()*this.cards.length)].card_images[0].image_url
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

    getCard(id) {
        return this.cards.find((c) => c.id === id);
    }
}

export const yugioh = new Yugioh();