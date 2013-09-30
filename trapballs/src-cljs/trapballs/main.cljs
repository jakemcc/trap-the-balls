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
    (set! (.-strokeStyle context) "blue")
    (set! (.-fillStyle context) "blue")
    (.arc context (:x ball) (:y ball) 3, 0, (* 2 Math/PI), false)
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

(defn init-state [context]
  {:context context
   :balls [(trapballs.crossover.ball/->Ball 30 30 20 3)]})

(defn physics [elapsed-time state]
  (let [updated-balls (mapv (fn [ball] (b/move ball elapsed-time))
                            (:balls state))]
    (merge state {:balls updated-balls})))

(defn render [state]
  (let [context (:context state)]
    (.clearRect context 0 0 600 300)
    (doseq [ball (:balls state)]
      (draw ball context))))

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
(defn ^:export main []
  (let [[surface context] (make-canvas "onscreen")
        state (init-state context)]
    (set-border surface)
    (dom/appendChild (body) surface)
    (.requestAnimationFrame js/window (start-stepping step
                                                      state))))
