(ns trapballs.main
  (:require [goog.dom :as dom]
            [trapballs.crossover.ball :as b]
            [trapballs.canvas :as canvas]))

(defn body []
  (.-body js/document))

(defn current-time []
  (.getTime (js/Date.)))

(defn move-balls [elapsed-time balls]
  (mapv (fn [ball] (b/move ball elapsed-time))
        balls))

(defn collide-balls [balls space]
  (mapv (fn [ball] (b/collide ball space)) balls))

(defn space [state]
  {:origin-x 0
   :origin-y 0
   :max-x (canvas/width (:canvas state))
   :max-y (canvas/height (:canvas state))})

(defn physics [elapsed-time state]
  (let [updated-balls (move-balls elapsed-time (:balls state))
        updated-balls (collide-balls updated-balls (space state))]
    (merge state {:balls updated-balls})))

(defn render [state]
  (canvas/render (:canvas state)
                 (:balls state)))

(defn step [elapsed-time state]
  "Takes elapsed time and current state and returns
   updated state."
  (let [new-state (physics elapsed-time state)]
    (render new-state)
    new-state))

(defn stepper [prior-time step-fn current-state]
  "Supplies step-fn the elapsed time between calls
   and current state. step-fn must return updated state."
  (fn [curr-time]
    (let [ts (- curr-time prior-time)
          new-state (step-fn ts current-state)]
      (.requestAnimationFrame js/window (stepper curr-time step-fn new-state)))))

(defn start-stepping [step-fn state]
  "Used to delay calling step-fn by one request frame
   in order to have an initial timestamp that is in
   same scale as timestamps given by window.requestAnimationFrame"
  (fn [timestamp]
    (.requestAnimationFrame js/window (stepper timestamp
                                               step-fn
                                               state))))

(defn num-between [x y]
  (+ x (rand-int y)))

(defn init-state [canvas]
  {:canvas canvas
   :balls (for [_ (range 100)]
            (assoc
                (trapballs.crossover.ball/->Ball
                 (num-between 200 400)
                 (num-between 100 100)
                 (num-between -50 50)
                 (num-between -50 50))
              :color (rand-nth ["red" "green" "blue" "brown" "pink" "lightgreen" "goldenrod" "purple"])))})

(defn ^:export main []
  (let [canvas (canvas/make-canvas "balls" 600 300)
        state (init-state canvas)]
    (canvas/add-border canvas)
    (dom/appendChild (body) (canvas/surface canvas))
    (.requestAnimationFrame js/window (start-stepping step
                                                      state))))
