import { Card } from "../Card/Card"

export function Hand({ cards, dispatch }) {
    /**
     * A hand is an ordered list of cards
     * Cards can be reordered in hand by dragging them
     */
    
    return(
      <div className="flex flexCenter Hand" style={{ flexWrap: "wrap" }}>
        {cards.map((card) => <Card {...card} dispatch={dispatch} key={card.id} moveable={false}/>
  )}
      </div>
    )
  }
  