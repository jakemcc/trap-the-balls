(ns trapballs.canvas
  (:require [trapballs.crossover.drawable :as d]
            trapballs.crossover.ball))

(extend-protocol d/Drawable
  trapballs.crossover.ball.Ball
  (draw [ball context]
    (.save context)
    (.beginPath context)
    (set! (.-strokeStyle context) (get ball :color "blue"))
    (set! (.-fillStyle context) (get ball :color "blue"))
    (.arc context (:x ball) (:y ball) 10 0 (* 2 Math/PI) false)
    (.closePath context)
    (.stroke context)
    (.fill context)
    (.restore context)
    ball))

(defn make-canvas
  [name width height]
  (letfn [(create [n w h]
            (let [c (.createElement js/document "canvas")]
              (set! (.-width c) w)
              (set! (.-height c) h)
              (set! (.-id c) n)
              c))]
    {:on-screen (create name width height)
     :off-screen (create (str name "offscreen") width height)}))

(defn add-border [canvas]
  (.setAttribute (:on-screen canvas) "style" "border:1px solid #000")
  (.setAttribute (:off-screen canvas) "style" "border:1px solid #000"))

(defn surface [canvas] (:on-screen canvas))

(defn context [canvas] :^CanvasRenderingContext2D
  (.getContext canvas "2d"))

(defn width [canvas]
  (.-width (:on-screen canvas)))

(defn height [canvas]
  (.-height (:on-screen canvas)))

(defn render [canvas drawables]
  (let [on-screen-canvas (:on-screen canvas)
        on-screen-context (context on-screen-canvas)
        off-screen (:off-screen canvas)
        off-screen-context (context off-screen)]
    (.clearRect on-screen-context 0 0 (width canvas) (height canvas))
    (.clearRect off-screen-context 0 0 (width canvas) (height canvas))
    (doseq [d drawables]
      (d/draw d off-screen-context))
    (.drawImage on-screen-context off-screen 0 0)))
