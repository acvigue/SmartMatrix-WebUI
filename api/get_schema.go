package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"tidbyt.dev/pixlet/runtime"
)

type HandlerStruct struct {
  AppletSource string
}
 
func GetSchema(w http.ResponseWriter, r *http.Request) {
  decoder := json.NewDecoder(r.Body)

	var body HandlerStruct
	err := decoder.Decode(&body)

	if err != nil {
		fmt.Printf("error parsing request body: %s\n", err)
    os.Exit(1)
	}

  //download the applet source
	req, err := http.NewRequest(http.MethodGet, body.AppletSource, nil)
	if err != nil {
		fmt.Printf("client: could not create request: %s\n", err)
		os.Exit(1)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("client: error making http request: %s\n", err)
		os.Exit(1)
	}

	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Printf("client: could not read response body: %s\n", err)
		os.Exit(1)
	}
	fmt.Printf("client: response body: %s\n", resBody)

  app, err := runtime.NewApplet("applet", resBody)
  if err != nil {
    fmt.Printf("error creating applet: %s\n", err)
    os.Exit(1)
  }

  fmt.Fprintf(w, "%s", string(app.SchemaJSON))
}