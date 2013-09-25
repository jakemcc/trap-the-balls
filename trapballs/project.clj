(defproject trapballs "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [org.clojure/clojurescript "0.0-1889"]]
  :plugins [[lein-cljsbuild/lein-cljsbuild "0.3.3"]]
  :profiles {:dev
             {:dependencies [[expectations "1.4.52"]]
              :plugins [[lein-autoexpect "1.0"]]}}
  :cljsbuild {
              :crossovers [trapballs.crossover]
              :crossover-path "src-cljs"
              :builds [{:source-paths ["src-cljs"]
                        :compiler {:output-to "resources/public/balls.js"}}]})
