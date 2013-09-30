(ns trapballs.main
  (:require [goog.dom :as dom]
            [trapballs.crossover.ball :as b]))

(defn make-canvas [id]
  (let [canvas (.createElement js/document "canvas")]
    (set! (. canvas -width) 600)
    (set! (. canvas -height) 300)
    (set! (. canvas -id) id)
    [canvas
     (.getContext canvas "2d")
     (.-width canvas)
     (.-height canvas)]))

(defn surface [canvas]
  (first canvas))

(defn context [canvas] :^CanvasRenderingContext2D
  (second canvas))

(defn width [canvas]
  (nth canvas 2))

(defn height [canvas]
  (nth canvas 3))

(defn set-border [elem]
  (.setAttribute elem "style" "border:1px solid #000"))

(defn body []
  (.-body js/document))

(defprotocol Drawable
  (draw [this context]))

(extend-protocol Drawable
  trapballs.crossover.ball.Ball
  (draw [ball context]
    (.save context)
    (.beginPath context)
    (set! (.-strokeStyle context) (get ball :color "blue"))
    (set! (.-fillStyle context) (get ball :color "blue"))
    (.arc context (:x ball) (:y ball) 10, 0, (* 2 Math/PI), false)
    (.closePath context)
    (.stroke context)
    (.fill context)
    (.restore context)
    ball))

(defn log [& msg]
                                        ;  (.log js/console (str msg))
  )

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
   :max-x (width (:on-screen-canvas state))
   :max-y (height (:on-screen-canvas state))})

(defn physics [elapsed-time state]
  (let [updated-balls (move-balls elapsed-time (:balls state))
        updated-balls (collide-balls updated-balls (space state))
        ]
    (merge state {:balls updated-balls})))

(defn render [state]
  (let [on-screen-canvas (:on-screen-canvas state)
        on-screen-context (context on-screen-canvas)
        off-screen (:off-screen-canvas state)
        off-screen-context (context off-screen)]
    (.clearRect on-screen-context 0 0 (width on-screen-canvas) (height on-screen-canvas))
    (.clearRect off-screen-context 0 0 (width on-screen-canvas) (height on-screen-canvas))
    (doseq [ball (:balls state)]
      (draw ball off-screen-context))
    (.drawImage on-screen-context (surface off-screen) 0 0)))

(defn step [elapsed-time state]
  (let [new-state (physics elapsed-time state)]
    (render new-state)
    new-state))

(defn stepper [prior-time step current-state]
  (fn [curr-time]
    (let [ts (- curr-time prior-time)
          _ (log ts)
          new-state (step ts current-state)]
      (.requestAnimationFrame js/window (stepper curr-time step new-state)))))

(defn start-stepping [step-fn state]
  (fn [timestamp]
    (.requestAnimationFrame js/window (stepper timestamp
                                               step-fn
                                               state))))

(defn num-between [x y]
  (+ x (rand-int y)))

(defn init-state [on-screen-canvas off-screen-canvas]
  {:on-screen-canvas on-screen-canvas
   :off-screen-canvas off-screen-canvas
   :balls (for [_ (range 100)]
            (assoc
                (trapballs.crossover.ball/->Ball
                 (num-between 200 400)
                 (num-between 100 100)
                 (num-between -50 50)
                 (num-between -50 50))
              :color (rand-nth ["red" "green" "blue" "brown" "pink" "lightgreen" "goldenrod" "purple"])))})

(defn ^:export main []
  (let [on-screen-canvas (make-canvas "onscreen")
        off-screen-canvas (make-canvas "offscreen")
        state (init-state on-screen-canvas
                          off-screen-canvas)]
    (set-border (surface on-screen-canvas))
    (dom/appendChild (body) (surface on-screen-canvas))
    (.requestAnimationFrame js/window (start-stepping step
                                                      state))))
