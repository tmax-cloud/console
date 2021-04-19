package Dashborad

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "DASHBOARD")
)

type Dashborad struct {
}

func New() (*Dashborad, error) {

	return &Dashborad{}, nil
}

func (g *Dashborad) Router() http.Handler {
	r := mux.NewRouter()

	return r
}
