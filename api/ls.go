package handler

import (
	"fmt"
	"io"
	"net/http"
	"os/exec"
)

func LS(w http.ResponseWriter, r *http.Request) {
	dateCmd := exec.Command("date")
	
		dateOut, err := dateCmd.Output()
		if err != nil {
			panic(err)
		}
		fmt.Fprintln(w, "> date")
		fmt.Fprintln(w, string(dateOut))
	
		_, err = exec.Command("date", "-x").Output()
		if err != nil {
			switch e := err.(type) {
			case *exec.Error:
				fmt.Fprintln(w, "failed executing:", err)
			case *exec.ExitError:
				fmt.Fprintln(w, "command exit rc =", e.ExitCode())
			default:
				panic(err)
			}
		}
	
		grepCmd := exec.Command("grep", "hello")
	
		grepIn, _ := grepCmd.StdinPipe()
		grepOut, _ := grepCmd.StdoutPipe()
		grepCmd.Start()
		grepIn.Write([]byte("hello grep\ngoodbye grep"))
		grepIn.Close()
		grepBytes, _ := io.ReadAll(grepOut)
		grepCmd.Wait()
	
		fmt.Fprintln(w, "> grep hello")
		fmt.Fprintln(w, string(grepBytes))
	
		lsCmd := exec.Command("bash", "-c", "ls -a -l -h")
		lsOut, err := lsCmd.Output()
		if err != nil {
			panic(err)
		}
		fmt.Fprintln(w, "> ls -a -l -h")
		fmt.Fprintln(w, string(lsOut))

		lsCmd = exec.Command("bash", "-c", "pwd")
		lsOut, err = lsCmd.Output()
		if err != nil {
			panic(err)
		}
		fmt.Fprintln(w, "> pwd")
		fmt.Fprintln(w, string(lsOut))

		lsCmd = exec.Command("bash", "-c", "ls -a -l -h /")
		lsOut, err = lsCmd.Output()
		if err != nil {
			panic(err)
		}
		fmt.Fprintln(w, "> ls -a -l -h /")
		fmt.Fprintln(w, string(lsOut))

		lsCmd = exec.Command("bash", "-c", "ls -a -l -h ../")
		lsOut, err = lsCmd.Output()
		if err != nil {
			panic(err)
		}
		fmt.Fprintln(w, "> ls -a -l -h ../")
		fmt.Fprintln(w, string(lsOut))
}