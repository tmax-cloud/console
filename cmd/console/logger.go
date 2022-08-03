package main

import (
	"fmt"
	"github.com/rs/zerolog"
	"os"
)

const (
	logLevel = "info"   // trace | debug | info | warn | crit
	logType  = "pretty" // pretty | json
)

type LogInfo struct {
	LogLevel string `json:"logLevel"`
	LogType  string `json:"logType"`
}

func NewLogInfo() *LogInfo {
	return &LogInfo{
		LogLevel: logLevel,
		LogType:  logType,
	}
}

func (c *LogInfo) getLogger() (logger zerolog.Logger) {
	switch c.LogType {
	case "json":
		logger = zerolog.New(os.Stdout)
	case "pretty":
		logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout})
	default:
		panic(fmt.Errorf("unknown logger type %s", c.LogType))
	}
	logger = logger.With().Timestamp().Caller().Logger()
	level, err := zerolog.ParseLevel(c.LogLevel)
	if err != nil {
		panic(err)
	}
	return logger.Level(level)
}
