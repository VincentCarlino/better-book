import React, { useRef, createContext, useState, useEffect, useContext } from "react";
import DragSelect from "dragselect";

const Context = createContext(undefined);

function DragSelectProvider({ children, settings = {} }) {
  const [ds, setDS] = useState();

  useEffect(() => {
    setDS((prevState) => {
      if (prevState) return prevState;
      return new DragSelect({});
    });
    return () => {
      if (ds) {
        ds.stop();
        setDS(undefined);
      }
    };
  }, [ds]);

  useEffect(() => {
    ds?.setSettings(settings);
  }, [ds, settings]);

  return <Context.Provider value={ds}>{children}</Context.Provider>;
}

function useDragSelect() {
  return useContext(Context);
}

export function DragSelectTest() {
    return(
        <>
        <DragSelectProvider settings={{ selectorClass: 'Card' }}>
            <Selectable />
        </DragSelectProvider>
        </>
    )
}

function Selectable() {

  const ds = useDragSelect();
  const inputEl = useRef();

  // adding a selectable element
  useEffect(() => {
    const element = inputEl.current;
    if (!element || !ds) return;
    ds.addSelectables(element);
    debugger;
  }, [ds, inputEl]);

  // subscribing to a callback
  useEffect(() => {
    if (!ds) return;
    debugger;
    const id = ds.subscribe("DS:end", (e) => {
        debugger;
      // do something
      console.log(e);
    });

    return () => ds.unsubscribe("DS:end", null, id);
  }, [ds]);

    return (<div ref={inputEl} className="beans" aria-labelledby="Selectable">
    Selectable
</div>)
}