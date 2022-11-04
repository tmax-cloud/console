package logger

import (
	"fmt"
	"github.com/rs/zerolog"
	"github.com/spf13/pflag"
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

func New(fs *pflag.FlagSet) *LogInfo {
	logInfo := &LogInfo{
		LogLevel: logLevel,
		LogType:  logType,
	}
	fs.StringVar(&logInfo.LogLevel, "log-level", "info", "trace | debug | info | warn | crit")
	fs.StringVar(&logInfo.LogType, "log-type", "pretty", "pretty | json")
	return logInfo
}

func (c *LogInfo) GetLogger() (logger zerolog.Logger) {
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
