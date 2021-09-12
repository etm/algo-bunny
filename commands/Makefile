INK    = inkscape
SVGDS  = $(wildcard *.svg)
GIFS   = $(patsubst %.svg,%.gif,$(SVGDS))
PNGS   = $(patsubst %.svg,%.png,$(SVGDS))

all: $(GIFS)
gifs: $(GIFS)

%.png: %.svg
	$(INK) -C --export-png=$@ $< >/dev/null 2>/dev/null

%.gif: %.png
	convert $< $@

clean:
	@rm -f *.gif
	@echo
	@echo "   Cleaned Directory!"
	@echo
