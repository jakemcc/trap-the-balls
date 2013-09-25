(ns trapballs.crossover.ball)

(defrecord Ball [x y dx dy])

(defn move [ball time]
  (-> ball
      (update-in [:x] #(+ % (* (:dx ball) (/ time 1000))))
      (update-in [:y] #(+ % (* (:dy ball) (/ time 1000))))))

(defn collide [time ball space]
  (let [time-frac (/ time 1000)]
    (-> ball
        (update-in [:dx] #(if (or (>= (:x ball) (:max-x space))
                                  (<= (:x ball) (:origin-x space)))
                            (- %)
                            %))
        (update-in [:dy] #(if (or (>= (:y ball) (:max-y space))
                                  (<= (:y ball) (:origin-y space)))
                            (- %)
                            %)))))
