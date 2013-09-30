(ns trapballs.crossover.ball-expectations
  (:require [expectations :refer :all]
            [trapballs.crossover.ball :refer :all]))

(expect (->Ball 5 11 1 2)
        (move (->Ball 4 9 1 2) 1000))

(expect (->Ball 6 5 -1 0)
        (collide (->Ball 6 5 1 0)
                 {:origin-x 0
                  :origin-y 0
                  :max-x 6
                  :max-y 6}))

(expect (->Ball 5 6 0 -1)
        (collide (->Ball 5 6 0 1)
                 {:origin-x 0
                  :origin-y 0
                  :max-x 6
                  :max-y 6}))
